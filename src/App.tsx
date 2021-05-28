import { useState } from 'react'
import './App.css';
import { books as bookList, Book } from './books'

function App() {
  const [books, setState] = useState<Book[]>(bookList)

  return (
    <div className="">
      <header className="">
        <h1>도서출판 킹제임스 도서 목록</h1>
      </header>
      <div>
        <table>
          <thead>
            <th>
              <td><input type="checkbox" /></td>
              <td>제목</td>
              <td>가격</td>
              <td>수량</td>
            </th>
          </thead>
          <tbody>
            { books.map((book, i) => {
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
                  <td>{book.discountedPrice}</td>
                  <td>
                    <input type="number" min={0} value={book.count} onChange={(e) => { 
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
        {books.filter(book => book.count > 0).map((item) => {
          return <p>{item.title}</p>
        })}
      </div>
    </div>
  );
}

export default App;
