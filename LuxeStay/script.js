class Room {
    #isBooked = false;
    constructor(id, type, floor, basePrice) {
        this.id = id;
        this.type = type;
        this.floor = floor;
        this.basePrice = basePrice;
    }

    get isBooked() {
        return this.#isBooked;
    }

    book() {
        if (this.#isBooked) {
            console.error("Phòng đã được đặt!");
            return false;
        }

        this.#isBooked = true;
        return true;
    }

    cancel() {
        this.#isBooked = false;
    }

    get basePrice() {
        return this.basePrice;
    }

    set basePrice(price) {
        if (price < 0) {
            console.error("Giá phòng không được nhỏ hơn 0!");
        }
        this.basePrice = price;
    }
}

class Customer {
    constructor(id, name, phone, referredBy = null) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.referredBy = referredBy;
    }
}

class BookingSystem {
    constructor() {
        this.rooms = [];
        this.bookingHistory = [];
    }
}

const hotelMatrix = [
    [
        new Room(101, "Tiêu chuẩn", 1, 1500000),
        new Room(102, "Tiêu chuẩn", 1, 1500000),
        new Room(103, "Cao cấp", 1, 3000000),
        new Room(104, "Cao cấp", 1, 3000000),
        new Room(105, "Tổng thống", 1, 10000000)
    ],

    [
        new Room(201, "Tiêu chuẩn", 2, 1500000),
        new Room(202, "Tiêu chuẩn", 2, 1500000),
        new Room(203, "Cao cấp", 2, 3000000),
        new Room(204, "Cao cấp", 2, 3000000),
        new Room(205, "Tổng thống", 2, 10000000)
    ],

    [
        new Room(301, "Tiêu chuẩn", 3, 1500000),
        new Room(302, "Tiêu chuẩn", 3, 1500000),
        new Room(303, "Cao cấp", 3, 3000000),
        new Room(304, "Cao cấp", 3, 3000000),
        new Room(305, "Tổng thống", 3, 10000000)
    ]
];