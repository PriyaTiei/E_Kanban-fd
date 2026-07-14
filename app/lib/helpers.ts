export const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const isToday = date.toDateString() === today.toDateString()

    if (isToday) {
        return `Today, ${date.toLocaleTimeString()}`
    }
    return date.toLocaleString()
}

export const fileFormat = {
    expectedSheets: [
        'products', 'stations', 'parts', 'stationParts', 'productPartExceptions', 
    ],
    expectedProductHeaders: [
        "variant",
    ],
    expectedStationsHeaders: [
        "name", "sequenceNo", "plant", 
    ],
    expectedPartsHeaders: [
        "partId", "partNumber", "name",
    ],
    expectedStationPartsHeaders: [
        "station", "part", "consumptionPerProduct", "binQuantity", "currentQuantity", "process", "prepLocation", "supplyLocation",
    ],
    expectedProductPartExceptionsHeaders: [
        "part", "product",
    ]
}

export function getPaginationItems(current: number, total: number) {
  const delta = 1
  const range = []
  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i)
  }
  if (current - delta > 2) range.unshift('...')
  if (current + delta < total - 1) range.push('...')
  range.unshift(1)
  if (total > 1) range.push(total)
  return range
}