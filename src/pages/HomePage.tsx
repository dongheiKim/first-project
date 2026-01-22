/* 
일기 목록 표시 (DiaryList 컴포넌트 사용)
날짜 필터 (DateFilter 컴포넌트)
localStorage에서 일기 데이터 불러오기 (useLocalStorage 훅)
일기 수정/삭제 핸들러
*/
import { DiaryList } from "../components/DiaryList";
import { DateFilter } from "../components/DateFilter";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { DiaryEntry } from "../context/AppContext";


export function HomePage() {
  const [diaryEntries, setDiaryEntries] = useLocalStorage('diaryEntries', []);
  // 일기 수정 핸들러
  const handleEdit = (id: string, updatedEntry: DiaryEntry) => {
    setDiaryEntries((prevEntries: any[]) =>
      prevEntries.map((entry) => (entry.id === id ? updatedEntry : entry))
    );
  }
  // 일기 삭제 핸들러
  const handleDelete = (id: string) => {
    setDiaryEntries((prevEntries: any[]) => prevEntries.filter((entry) => entry.id !== id));
  };
  
  return (
    <div>
      <DateFilter onFilterChange={function (filter: string | null): void {
              throw new Error("Function not implemented.");
          } } />
          {/* 온업데이트 작성방식다름 */}
      <DiaryList entries={diaryEntries} {onUpdate || handleEdit} onDelete={handleDelete} /> 
    </div>
  );
}
export default HomePage;