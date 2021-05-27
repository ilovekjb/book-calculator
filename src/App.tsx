import './App.css';
import { books } from './books'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>도서출판 킹제임스 도서 목록</h1>
      </header>
      <div>
        <table>
          <thead>
            <th>
              <td></td>
              <td>제목</td>
              <td>가격</td>
              <td>수량</td>
            </th>
          </thead>
          <tbody>
            { books.map((book) => {
              return (
                <tr>
                  <td><input type="checkbox" /></td>
                  <td>{book.title}</td>
                  <td>{book.discountedPrice}</td>
                  <td><input type="number" /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
