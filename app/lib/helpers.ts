export const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const isToday = date.toDateString() === today.toDateString()

    if (isToday) {
        return `Today, ${date.toLocaleTimeString()}`
    }
    return date.toLocaleString()
}