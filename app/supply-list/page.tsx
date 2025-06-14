'use client'
import { useEffect, useState } from "react"
import { fetchSupplyKanbans } from "../lib/api"
import SupplyListTable from "./SupplyListTable"
import { KanbanItem } from "../lib/types"

export default function SupplyListPage() {
  const [data, setData] = useState<KanbanItem[]>([])
  useEffect(() => {
    fetchSupplyKanbans().then(setData)
  }, [])
  return (
    <SupplyListTable data={data} />
  )
}
