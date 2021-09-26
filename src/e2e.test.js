import puppeteer from "puppeteer";

let browser;
/** @type puppeteer.Page */
let page;

beforeAll(async () => {
    browser = await puppeteer.launch({
        headless: false,
        // slowMo: 80,
    });

    const context = browser.defaultBrowserContext();
    context.overridePermissions('http://localhost:3000', ['clipboard-read', 'clipboard-write'])

    page = await browser.newPage();
});

async function getBook(name) {
    return await page.$x(`//td[contains(., '${name}')]`)
}

async function checkBook(name) {
    const bookEl = await getBook(name)
    const checkBoxEl = await bookEl[0].$x("preceding-sibling::*[1]/input")
    
    await checkBoxEl[0].click()
}

async function isBookChecked(name) {
    const bookEl = await getBook(name)
    const checkBoxEl = await bookEl[0].$x("preceding-sibling::*[1]/input")
    
    return await page.evaluate(el => el.checked, checkBoxEl[0])
}

async function setBookCount(name, count) {
    const bookEl = await getBook(name)
    const countEl = await bookEl[0].$x("following-sibling::*[2]/input")
    
    await page.evaluate(el => el.value = '', countEl[0])
    await countEl[0].type(count)
}

async function getBookCount(name) {
    const bookEl = await getBook(name)
    const countEl = await bookEl[0].$x("following-sibling::*[2]/input")
    
    return await page.evaluate(el => el.value, countEl[0])
}

async function getBookPrice(name) {
    const bookEl = await getBook(name)
    const priceEl = await bookEl[0].$x("following-sibling::*[1]")
    
    return await page.evaluate(el => el.textContent, priceEl[0])
}

beforeEach(async () => {
    await page.goto('http://localhost:3000');
})

describe('free book price change', () => {
    it('500 from start', async () => {
        const price = await getBookPrice('일곱 교회')

        expect(price).toBe('500원')
    });

    it('checking free books only does not change the price', async () => {
        await checkBook('일곱 교회')

        const price = await getBookPrice('일곱 교회')

        expect(price).toBe('500원')
    });

    it('checking paid books makes the free books free', async () => {
        await checkBook('성령의 열매')

        const price = await getBookPrice('일곱 교회')

        expect(price).toBe('0원')
    });

    it('checking multiple paid books makes the free books free', async () => {
        await checkBook('성령의 열매')
        await checkBook('확실한 기초')

        const price = await getBookPrice('일곱 교회')

        expect(price).toBe('0원')
    });

    it('uncheck all paid books restore the price', async () => {
        await checkBook('성령의 열매')
        await checkBook('확실한 기초')
        await checkBook('확실한 기초') // uncheck
        await checkBook('성령의 열매') // uncheck

        const price = await getBookPrice('일곱 교회')

        expect(price).toBe('500원')
    })
});

describe('checkbox input', () => {
    it('check', async () => {
        await checkBook('일곱 교회')

        const count = await getBookCount('일곱 교회')

        expect(count).toBe('1')
    })

    it('uncheck', async () => { 
        await setBookCount('일곱 교회', '3')
        await checkBook('일곱 교회')

        const count = await getBookCount('일곱 교회')

        expect(count).toBe('0')
    })
})

describe('number input', () => {
    it('0 -> 1', async () => {
        await setBookCount('일곱 교회', '1')

        const checked = await isBookChecked('일곱 교회')

        expect(checked).toBe(true)
    })

    it('1 -> 0', async () => {
        await setBookCount('일곱 교회', '1')
        await setBookCount('일곱 교회', '0')

        const checked = await isBookChecked('일곱 교회')

        expect(checked).toBe(false)
    })

    it('1 -> 2', async () => {
        await checkBook('일곱 교회')
        await setBookCount('일곱 교회', '2')

        const checked = await isBookChecked('일곱 교회')

        expect(checked).toBe(true)
    })
})

async function getInvoiceBook(name) {
    return await page.$x(`//div[contains(@class, 'invoice')]//td[contains(., '${name}')]`)
}

async function getInvoiceBookCount(name) {
    const bookEl = await getInvoiceBook(name)
    const countEl = await bookEl[0].$x("following-sibling::*[1]")
    
    return await page.evaluate(el => el.textContent, countEl[0])
}

async function getInvoiceBookPrice(name) {
    const bookEl = await getInvoiceBook(name)
    const priceEl = await bookEl[0].$x("following-sibling::*[2]")
    
    return await page.evaluate(el => el.textContent, priceEl[0])
}

describe('price table', () => {
    it('no book', async () => {
        const msgDiv = await page.$('.invoice .msg')
        const msg = await page.evaluate(el => el.textContent, msgDiv)
        
        expect(msg).toContain('주문할 책이 없습니다.')
    })

    it('add new', async () => {
        await checkBook('일곱 교회')

        const book = await getInvoiceBook('일곱 교회')

        expect(book.length).toBe(1)
    })

    it('remove', async () => {
        await setBookCount('성령의 열매', '2')
        await setBookCount('일곱 교회', '3')
        await checkBook('일곱 교회')

        const book = await getInvoiceBook('일곱 교회')

        expect(book.length).toBe(0)
    })

    it('remove and no book', async () => {
        await setBookCount('일곱 교회', '3')
        await checkBook('일곱 교회')

        const msgDiv = await page.$('.invoice .msg')
        const msg = await page.evaluate(el => el.textContent, msgDiv)
        
        expect(msg).toContain('주문할 책이 없습니다.')
    })

    it('change count', async () => {
        await setBookCount('성령의 열매', '2')

        const count1 = await getInvoiceBookCount('성령의 열매')

        expect(count1).toBe('2권')

        await setBookCount('성령의 열매', '5')

        const count2 = await getInvoiceBookCount('성령의 열매')

        expect(count2).toBe('5권')
    })

    it('show price correctly', async () => {
        await setBookCount('성령의 열매', '2')
        
        const price = await getInvoiceBookPrice('성령의 열매')

        expect(price).toBe('20000원')
    })
})

async function getShipping() {
    const shipping = await getInvoiceBook('배송료')
    const priceEl = await shipping[0].$x("following-sibling::*[2]")

    return await page.evaluate(el => el.textContent, priceEl[0])
}

describe('shipping fees', () => {
    describe('free only', () => {
        it('under 20000', async () => {
            await checkBook('일곱 교회')

            const shipping = await getShipping()

            expect(shipping).toBe('3000원')
        })

        it('over 20000', async () => {
            await checkBook('일곱 교회')
            await setBookCount('두 홍수', '50')

            const shipping = await getShipping()

            expect(shipping).toBe('0원')
        })
    })

    describe('with paid', () => {
        it('over 60000', async () => {
            await setBookCount('성령의 열매', '6')
            await checkBook('일곱 교회')

            const shipping = await getShipping()

            expect(shipping).toBe('0원')
        })

        it('<= 5 books', async () => {
            await setBookCount('성령의 열매', '5')

            const shipping = await getShipping()

            expect(shipping).toBe('3000원')
        })

        it('<= 10 books', async () => {
            await setBookCount('성령의 열매', '1')
            await setBookCount('두 홍수', '9')

            const shipping = await getShipping()

            expect(shipping).toBe('4000원')
        })

        it('other', async () => {
            await setBookCount('성령의 열매', '1')
            await setBookCount('두 홍수', '12')

            const shipping = await getShipping()

            expect(shipping).toBe('5000원')
        })
    })
})

// It doesn't work for some reason. Copy should be tested manually.
// describe('copy button', () => {
//     it('copies text correctly', async () => {
//         await checkBook('일곱 교회')
//         await setBookCount('성령의 열매', '2')

//         const copyBtn = await page.$('.copy-btn')

//         await page.evaluate(el => el.click(), copyBtn)

//         const clipboard = await page.evaluate(() => navigator.clipboard.readText())

//         expect(clipboard).toBe('asdf')
//     })
// })

afterAll(() => browser.close());