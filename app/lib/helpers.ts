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
        "name", "plant",
    ],
    expectedPartsHeaders: [
        "partId", "partNumber", "name",
    ],
    expectedStationPartsHeaders: [
        "station", "part", "allowed_for_all_products", "consumptionPerProduct", "binQuantity", "currentQuantity", "process", "prepLocation", "supplyLocation",
    ],
    expectedProductPartExceptionsHeaders: [
        "part", "product",
    ]
}