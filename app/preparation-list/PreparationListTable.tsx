"use client"

import KanbanTable from "../components/KanbanTable"
import { updatePreparationKanban, deletePreparationKanban } from "../lib/api"

export default function PreparationListTable({ data, onRefresh }: { data: any[]; onRefresh: () => void }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <KanbanTable
        data={data}
        onUpdate={updatePreparationKanban}
        onDelete={deletePreparationKanban}
        title="Preparation List"
        onRefresh={onRefresh}
      />
    </div>
  )
}
