'use client'
import { useEffect, useState } from "react"
import { fetchPreparationKanbans } from "../lib/api"
import PreparationListTable from "./PreparationListTable"
import { KanbanItem } from "../lib/types"

export default function PreparationListTableClient() {
  const [data, setData] = useState<KanbanItem[]>([])
  useEffect(() => {
    fetchPreparationKanbans().then(setData)
  }, [])
  return <PreparationListTable data={data} />
}
