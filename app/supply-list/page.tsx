import { fetchSupplyKanbans } from "../lib/api"
import SupplyListTable from "./SupplyListTable"

export default async function SupplyListPage() {
  const data = await fetchSupplyKanbans()

  return (
    <SupplyListTable data={data} />
  )
}
