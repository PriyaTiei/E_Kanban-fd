"use client"

import KanbanTable from "../components/KanbanTable"
import { updateSupplyKanban, deleteSupplyKanban } from "../lib/api"

export default function SupplyListTable({data}: {data: any[]}) {

  return (
    <div className="container mx-auto px-4 py-8">
      <KanbanTable data={data} onUpdate={updateSupplyKanban} onDelete={deleteSupplyKanban} title="Supply List" />
    </div>
  )
}
