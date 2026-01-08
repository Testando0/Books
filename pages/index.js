import { useState, useEffect } from "react";

const CORS = "https://proxycors.io/?";

export default function Home() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [text, setText] = useState("");
  const [page, setPage] = useState(0);
  const [dark, setDark] = useState(true);

  const PAGE_SIZE = 2000; // caracteres por “página”

  async function search() {
    const res = await fetch(
      `https://gutendex.com/books/?search=${encodeURIComponent(query)}`
    );
    const data = await res.json();
    setBooks(data.results || []);
  }

  async function openBook(book) {
    const formats = book.formats;

    const url =
      formats["text/plain; charset=utf-8"] ||
      formats["text/plain"] ||
      formats["text/html"];

    if (!url) return;

    const proxied = CORS + encodeURIComponent(url);
    const res = await fetch(proxied);
    const t = await res.text();

    // remove HTML se houver
    const plain = t.replace(/<[^>]+>/g, "");

    setText(plain);
    setPage(0);

    // salvar progresso
    localStorage.setItem("lastBook", book.title);
  }

  const totalPages = Math.ceil(text.length / PAGE_SIZE);
  const currentText = text.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className={dark ? "dark" : "light"}>
      <h1>📚 Leitor público estilo Google Play Livros</h1>

      <button onClick={() => setDark(!dark)}>
        Alternar tema ({dark ? "escuro" : "claro"})
      </button>

      <div>
        <input
          placeholder="Buscar livros públicos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={search}>Buscar</button>
      </div>

      <div className="container">
        <div className="list">
          {books.map((b) => (
            <div key={b.id} className="item" onClick={() => openBook(b)}>
              <strong>{b.title}</strong>
              <br />
              {b.authors.map((a) => a.name).join(", ")}
            </div>
          ))}
        </div>

        <div className="reader">
          {text ? (
            <>
              <div className="pages">
                <button disabled={page === 0} onClick={() => setPage(page - 1)}>
                  ◀
                </button>

                <span>
                  Página {page + 1} de {totalPages}
                </span>

                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(page + 1)}
                >
                  ▶
                </button>
              </div>

              <pre>{currentText}</pre>
            </>
          ) : (
            "Selecione um livro"
          )}
        </div>
      </div>
    </div>
  );
  }
