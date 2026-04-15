import { Link } from "react-router-dom";
import "./SearchPage.css";

function NotFoundPage() {
  return (
    <main className="not-found-page">
      <section className="not-found-page__card">
        <p
          style={{
            margin: "0 0 12px",
            color: "#9a7b68",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          404 오류
        </p>
        <h1>페이지를 찾을 수 없습니다</h1>
        <p>
          요청하신 경로가 현재 프로젝트에 존재하지 않거나, 이번 이식 작업에서 아직 연결되지 않았을 수 있습니다.
        </p>
        <div className="not-found-page__actions">
          <Link to="/">메인으로 이동</Link>
          <Link to="/search">검색하기</Link>
        </div>
      </section>
    </main>
  );
}

export default NotFoundPage;
