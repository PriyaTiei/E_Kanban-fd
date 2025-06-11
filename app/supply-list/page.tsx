import KanbanTable from "../components/KanbanTable"
import { fetchSupplyKanbans, updateSupplyKanban, deleteSupplyKanban } from "../lib/api"

export default async function SupplyListPage() {
  const data = await fetchSupplyKanbans()

  return (
    <div className="container mx-auto px-4 py-8">
      <KanbanTable data={data} onUpdate={updateSupplyKanban} onDelete={deleteSupplyKanban} title="Supply List" />
    </div>
  )
}
