export default function SubjectsLoading() {
  return (
    <div className="space-y-6 p-6 animate-pulse">
      <div className="h-8 w-48 bg-slate-200 rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-slate-200 rounded-2xl" />)}
      </div>
      <div className="h-12 bg-slate-200 rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-40 bg-slate-200 rounded-2xl" />)}
      </div>
    </div>
  );
}
