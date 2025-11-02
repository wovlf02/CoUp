import { Card } from "../../ui/card";

export default function StudyDiscoveryFilters() {
  return (
    <Card className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">필터</h2>
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">카테고리</label>
        <select id="category" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
          <option>전체 카테고리</option>
          <option>프로그래밍</option>
          <option>어학</option>
          <option>자격증</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">스터디 상태</label>
        <div className="mt-1 space-y-2">
          <label className="inline-flex items-center">
            <input type="checkbox" className="form-checkbox" />
            <span className="ml-2">모집 중</span>
          </label>
          <label className="inline-flex items-center ml-4">
            <input type="checkbox" className="form-checkbox" />
            <span className="ml-2">진행 중</span>
          </label>
        </div>
      </div>
      {/* Add more filters as per UI/UX spec */}
    </Card>
  );
}