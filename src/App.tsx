import { useState } from 'react'
import './style.css'
import { books as bookList, Book } from './books'

function App() {
  const [books, setState] = useState<Book[]>(bookList)
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
              <th className="price">가격</th>
              <th className="number">수량</th>
            </tr>
          </thead>
          <tbody>
            { (search === '' ? books : books.filter((book) => book.title.includes(search))).map((book, i) => {
              return (
                <tr>
                  <td>
                    <input type="checkbox" checked={book.checked} onChange={(e) => {
                      if ((e.target as any).checked) {
                        const newBooks = books.map((item, index) => {
                          if (index === i) {
                            return { ...item, count: 1, checked: true }
                          }

                          return item
                        })
                        setState(newBooks)
                      } else {
                        const newBooks = books.map((item, index) => {
                          if (index === i) {
                            return { ...item, count: 0, checked: false }
                          }

                          return item
                        })
                        setState(newBooks)
                      }
                    }} />
                  </td>
                  <td>{book.title}</td>
                  <td className="price">{book.discountedPrice}</td>
                  <td className="number">
                    <input className="number-input" type="number" min={0} value={book.count} onChange={(e) => { 
                      const newBooks = books.map((item, index) => {
                        if (index === i) {
                          const count = parseInt(e.target.value)
                          const checked = count !== 0

                          return { ...item, count, checked }
                        }

                        return item
                      })

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
        <table style={{ width: '100%'}}>
          <thead>
            <tr>
              <th>제목</th>
              <th className="number">수량</th>
              <th className="price">가격</th>
            </tr>
          </thead>
          <tbody>
          {books.filter(book => book.count > 0).map((item) => {
            return (
              <tr>
                <td>{item.title}</td>
                <td className="number">{item.count}</td>
                <td className="price">{item.discountedPrice * item.count}</td>
              </tr>
            )
          })}
          </tbody>
        </table>
        <p>총액: {books.reduce((sum, book) => {
          return sum + book.discountedPrice * book.count
        }, 0)}</p>
      </div>
    </div>
  );
}

export default App;
