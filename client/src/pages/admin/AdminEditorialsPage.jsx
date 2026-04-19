import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useEditorials } from "../../context/EditorialContext";
import "./AdminPages.css";

function ChevronUpIcon() {
  return (
    <svg className="admin-editorials-order__icon" viewBox="0 0 24 24" aria-hidden>
      <path fill="currentColor" d="M12 6.4 18.35 16H5.65L12 6.4z" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg className="admin-editorials-order__icon" viewBox="0 0 24 24" aria-hidden>
      <path fill="currentColor" d="M12 17.6 5.65 8h12.7L12 17.6z" />
    </svg>
  );
}

function AdminEditorialsPage() {
  const { deleteEditorial, fetchAdminEditorials, reorderEditorials } = useEditorials();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [reorderBusy, setReorderBusy] = useState(false);
  const [flashRowIds, setFlashRowIds] = useState(() => new Set());
  const flashClearRef = useRef(null);

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

  useEffect(() => {
    return () => {
      if (flashClearRef.current) {
        window.clearTimeout(flashClearRef.current);
      }
    };
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("이 에디토리얼을 삭제하시겠습니까?")) {
      return;
    }

    await deleteEditorial(id);
    setItems((current) => current.filter((item) => item._id !== id));
  };

  const handleMove = async (index, delta) => {
    const nextIndex = index + delta;
    if (nextIndex < 0 || nextIndex >= items.length || reorderBusy) {
      return;
    }

    const idMoving = String(items[index]._id);
    const idOther = String(items[nextIndex]._id);

    const previous = items;
    const next = [...items];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    setItems(next);
    setReorderBusy(true);
    setError("");

    try {
      const updated = await reorderEditorials(next.map((item) => item._id));
      setItems(updated);
      if (flashClearRef.current) {
        window.clearTimeout(flashClearRef.current);
      }
      setFlashRowIds(new Set([idMoving, idOther]));
      flashClearRef.current = window.setTimeout(() => {
        setFlashRowIds(new Set());
        flashClearRef.current = null;
      }, 720);
    } catch (reorderError) {
      setError(reorderError.message || "순서 저장에 실패했습니다.");
      setItems(previous);
    } finally {
      setReorderBusy(false);
    }
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
          <table className="admin-page__table admin-page__table--editorials">
            <thead>
              <tr>
                <th className="admin-page__table--editorials__col-order">순서</th>
                <th>제목</th>
                <th>포맷</th>
                <th>상태</th>
                <th>슬러그</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr
                  key={item._id}
                  className={flashRowIds.has(String(item._id)) ? "admin-editorials-row--flash" : undefined}
                >
                  <td>
                    <div className="admin-editorials-order" role="group" aria-label="순서 변경">
                      <button
                        aria-label="위로 이동"
                        className="admin-editorials-order__seg admin-editorials-order__seg--up"
                        disabled={reorderBusy || index === 0}
                        type="button"
                        onClick={() => void handleMove(index, -1)}
                      >
                        <ChevronUpIcon />
                      </button>
                      <span className="admin-editorials-order__divider" aria-hidden />
                      <button
                        aria-label="아래로 이동"
                        className="admin-editorials-order__seg admin-editorials-order__seg--down"
                        disabled={reorderBusy || index === items.length - 1}
                        type="button"
                        onClick={() => void handleMove(index, 1)}
                      >
                        <ChevronDownIcon />
                      </button>
                    </div>
                  </td>
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
