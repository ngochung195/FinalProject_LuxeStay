function getStars(price) {
    if (price <= 1500000) return "⭐";
    if (price <= 3000000) return "⭐⭐";
    return "⭐⭐⭐";
}

function calculateReferralPoints(customerID, customers) {
    const customer = customers.find(c => c.id === customerID);

    if (!customer) return 0;

    if (customer.referredBy === null) return 0;

    return 10 + calculateReferralPoints(customer.referredBy, customers);
}

function saveData() {
    const bookedIds = hotelMatrix.flat().filter(r => r.isBooked).map(r => r.id);
    localStorage.setItem("bookedRooms", JSON.stringify(bookedIds));
    localStorage.setItem("bookingHistory", JSON.stringify(bookingSystem.bookingHistory));
}

function loadData() {
    const bookedIds = JSON.parse(localStorage.getItem("bookedRooms")) || [];
    hotelMatrix.forEach(floor => {
        floor.forEach(room => {
            if (bookedIds.includes(room.id)) {
                room.book();
            }
        });
    });

    bookingSystem.bookingHistory = JSON.parse(localStorage.getItem("bookingHistory")) || [];
}

function getRevenueByRoomType(history) {
    return history.reduce((acc, item) => {
        const type = item.room.type;

        acc[type] = (acc[type] || 0) + item.room.basePrice;

        return acc;
    }, {});
}