import { BoardList } from '@/components/boards/BoardList';
import { Navigation } from '@/components/layout/Navigation';
import { Header } from '@/components/layout/Header';

export default function BoardsPage() {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Navigation />
        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="text-3xl font-bold mb-6">Доски</h1>
          <BoardList />
        </main>
      </div>
    </div>
  );
}
