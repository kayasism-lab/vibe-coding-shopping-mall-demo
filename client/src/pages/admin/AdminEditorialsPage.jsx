import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useEditorials } from "../../context/EditorialContext";
import "./AdminPages.css";

function AdminEditorialsPage() {
  const { deleteEditorial, fetchAdminEditorials } = useEditorials();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        setIsLoading(true);
        setItems(await fetchAdminEditorials());
        setError("");
      } catch (loadError) {
        setError(loadError.message || "에디토리얼 목록을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    void run();
  }, [fetchAdminEditorials]);

  const handleDelete = async (id) => {
    if (!window.confirm("이 에디토리얼을 삭제하시겠습니까?")) {
      return;
    }

    await deleteEditorial(id);
    setItems((current) => current.filter((item) => item._id !== id));
  };

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">Editorial CMS Lite</p>
          <h1 className="admin-page__title">에디토리얼</h1>
        </div>
        <Link className="admin-page__button" to="/admin/editorials/new">
          에디토리얼 등록
        </Link>
      </header>

      <section className="admin-page__table-card">
        <div className="admin-page__pagination-summary">
          <p className="admin-page__muted">총 {items.length}개의 에디토리얼</p>
          {error ? <p className="admin-page__pagination-error">{error}</p> : null}
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="admin-page__table">
            <thead>
              <tr>
                <th>제목</th>
                <th>포맷</th>
                <th>상태</th>
                <th>슬러그</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td>
                    <strong>{item.title}</strong>
                    <small>{item.subtitle}</small>
                  </td>
                  <td>{item.format}</td>
                  <td>
                    <span className={`admin-page__tag ${item.status === "published" ? "is-new" : ""}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>{item.slug}</td>
                  <td>
                    <div className="admin-page__actions">
                      <Link className="admin-page__icon-button" to={`/editorial/${item.slug}`}>
                        보기
                      </Link>
                      <Link className="admin-page__icon-button" to={`/admin/editorials/${item._id}/edit`}>
                        수정
                      </Link>
                      <button className="admin-page__icon-button" type="button" onClick={() => void handleDelete(item._id)}>
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isLoading ? (
          <div className="admin-page__empty">
            <h3>에디토리얼 목록을 불러오는 중입니다.</h3>
          </div>
        ) : null}
      </section>
    </section>
  );
}

export default AdminEditorialsPage;
