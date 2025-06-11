import KanbanTable from "../components/KanbanTable"
import { fetchPreparationKanbans, updatePreparationKanban, deletePreparationKanban } from "../lib/api"

export default async function PreparationListPage() {
  const data = await fetchPreparationKanbans()

  return (
    <div className="container mx-auto px-4 py-8">
      <KanbanTable
        data={data}
        onUpdate={updatePreparationKanban}
        onDelete={deletePreparationKanban}
        title="Preparation List"
      />
    </div>
  )
}
