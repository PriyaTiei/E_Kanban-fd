import { fetchPreparationKanbans } from "../lib/api"
import PreparationListTable from "./PreparationListTable"

export default async function PreparationListPage() {
  const data = await fetchPreparationKanbans()

  return (
    <PreparationListTable data={data} />
  )
}
