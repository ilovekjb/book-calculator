import { useState } from 'react'
import './style.css'
import { paid, free, Book } from './books'

function App() {
  const [books, setState] = useState<Book[]>([...paid, ...free])
  const [search, setSearch] = useState('')
  const [showMsg, setShowMsg] = useState(false)

  const booksTotal = books.reduce((sum, book) => {
    return sum + book.discountedPrice * book.count
  }, 0)
  const booksCount = books.reduce((sum, book) => {
    return sum + book.count
  }, 0)
  const buying = books.filter(book => book.count > 0)
  const buyingTitles = buying.map(book => book.title)

  const hasPaid = paid.filter(book => buyingTitles.includes(book.title)).length > 0
  let shipping = 0

  if (hasPaid) {
    if (booksTotal >= 60000) {
      shipping = 0
    } else if (booksCount <= 5) {
      shipping = 3000
    } else if (booksCount <= 10) {
      shipping = 4000
    } else {
      shipping = 5000
    }
  } else {
    if (booksTotal >= 20000) {
      shipping = 0
    } else {
      shipping = 3000
    }
  }

  const total = booksTotal + shipping

  return (
    <div className="content">
      <header className="title">
        <h1>도서출판 킹제임스 도서 목록</h1>
      </header>
      <div style={{marginBottom: 16}}>
        <input 
          type="text"
          className="search"
          placeholder="찾고 싶은 책을 입력하세요" 
          onChange={(e) => {
            setSearch(e.target.value)
          }}
        />
      </div>
      <div>
        <table style={{ width: '100%'}}>
          <thead>
            <tr>
              <th></th>
              <th>제목</th>
              <th className="price-header">가격</th>
              <th className="number">수량</th>
            </tr>
          </thead>
          <tbody>
            { (search === '' ? books : books.filter((book) => book.title.includes(search))).map((book, i) => {
              return (
                <tr key={i}>
                  <td>
                    <input type="checkbox" checked={book.checked} onChange={(e) => {
                      if ((e.target as any).checked) {
                        let newBooks = books.map((item, index) => {
                          if (index === i) {
                            return { ...item, count: 1, checked: true }
                          }

                          return item
                        })

                        if (paid.filter(book => book.title === books[i].title).length > 0) {
                          newBooks = newBooks.map(item => {
                            if (item.discountedPrice <= 500) {
                              return { ...item, discountedPrice: 0 }
                            }

                            return item
                          })
                        }

                        setState(newBooks)
                      } else {
                        let newBooks = books.map((item, index) => {
                          if (index === i) {
                            return { ...item, count: 0, checked: false }
                          }

                          return item
                        })

                        if (paid.filter(book => buyingTitles.includes(book.title)).length === 0) {
                          newBooks = newBooks.map(item => {
                            if (item.discountedPrice === 0) {
                              return { ...item, discountedPrice: 500 }
                            }

                            return item
                          })
                        }

                        setState(newBooks)
                      }
                    }} />
                  </td>
                  <td>{book.title}</td>
                  <td className="price">{book.discountedPrice}원</td>
                  <td className="number">
                    <input className="number-input" type="number" min={0} value={book.count} onChange={(e) => { 
                      const count = parseInt(e.target.value)
                      let newBooks = books.map((item, index) => {
                        if (index === i) {
                          const checked = count !== 0

                          return { ...item, count, checked }
                        }

                        return item
                      })

                      if (count > 0) {
                        if (paid.filter(book => book.title === books[i].title).length > 0) {
                          newBooks = newBooks.map(item => {
                            if (item.discountedPrice <= 500) {
                              return { ...item, discountedPrice: 0 }
                            }
  
                            return item
                          })
                        }
                      } else {
                        if (paid.filter(book => buyingTitles.includes(book.title)).length === 0) {
                          newBooks = newBooks.map(item => {
                            if (item.discountedPrice === 0) {
                              return { ...item, discountedPrice: 500 }
                            }

                            return item
                          })
                        }
                      }

                      setState(newBooks)
                    }}/>권
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div>
        <h2 className="title">주문할 책들</h2>
        {
          buying.length > 0 ? (
            <div>
              <table style={{ width: '100%'}}>
                <thead>
                  <tr>
                    <th>제목</th>
                    <th className="number">수량</th>
                    <th className="price">가격</th>
                  </tr>
                </thead>
                <tbody>
                {buying.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td>{item.title}</td>
                      <td className="number">{item.count}권</td>
                      <td className="price">{item.discountedPrice * item.count}원</td>
                    </tr>
                  )
                })}
                <tr>
                  <td>배송료</td>
                  <td></td>
                  <td className="price">{shipping}원</td>
                </tr>
                <tr style={{borderTop: '1px solid #999'}}>
                  <td>총액</td>
                  <td></td>
                  <td className="price">{total}원</td>
                </tr>
                </tbody>
              </table>
              <div className="button-wrap">
                <button className="copy-btn" onClick={() => {
                  const text = buying.map(book => `${book.title} ${book.count}권`).join(', ')

                  navigator.clipboard.writeText(text);
                  
                  setShowMsg(true)

                  setTimeout(() => {
                    setShowMsg(false)
                  }, 5000)
                }}>복사하기</button>
              </div>
              {
                showMsg 
                ? <div className="msg">복사되었습니다. 주문글에 "책이름"에 붙여 넣으세요.</div>
                : null
              }
            </div>
          ) : (
            <div className="msg">주문할 책이 없습니다. 주문하고 싶은 책을 위에서 선택하세요.</div>
          )
        }

      </div>
    </div>
  );
}

export default App;
