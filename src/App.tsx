import { useState } from 'react'
import './style.css'
import { paid, free, Book } from './books'

function App() {
  const [books, setState] = useState<Book[]>([...paid, ...free])
  const [search, setSearch] = useState('')

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

                        const buyingTitles = newBooks.filter(book => book.checked).map(book => book.title)

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
                        const buyingTitles = newBooks.filter(book => book.checked).map(book => book.title)

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
                    }}/>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div>
        <h2>주문할 책들</h2>
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
            {books.filter(book => book.count > 0).map((item, index) => {
              return (
                <tr key={index}>
                  <td>{item.title}</td>
                  <td className="number">{item.count}권</td>
                  <td className="price">{item.discountedPrice * item.count}원</td>
                </tr>
              )
            })}
            </tbody>
          </table>
          <p>총액: {books.reduce((sum, book) => {
            return sum + book.discountedPrice * book.count
          }, 0)}</p>
        </div>
        <div className="button-wrap">
          <button className="copy-btn" onClick={() => {
            navigator.clipboard.writeText('text to copy');
          }}>복사하기</button>
        </div>
      </div>
    </div>
  );
}

export default App;
