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

    set price(value) {
        if (value < 0) {
            throw new Error("Giá phòng không được nhỏ hơn 0!");
        }
        this.basePrice = value;
    }

    get price() {
        return this.basePrice;
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

const allCustomers = [
    new Customer("C001", "Hoàng Ánh", "0905555555", null),       // 0 điểm
    new Customer("C002", "Lê Trang", "0903333333", "C001"),   // 10 điểm (← A)
    new Customer("C003", "Trần Bắc", "0902222222", "C002"),   // 20 điểm (← B ← A)
    new Customer("C004", "Nguyễn Hoa", "0901111111", "C001"),   // 10 điểm (← A)
];

const bookingSystem = new BookingSystem();

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
    ],
    [
        new Room(401, "Tiêu chuẩn", 4, 1500000),
        new Room(402, "Tiêu chuẩn", 4, 1500000),
        new Room(403, "Cao cấp", 4, 3000000),
        new Room(404, "Cao cấp", 4, 3000000),
        new Room(405, "Tổng thống", 4, 10000000)
    ],
    [
        new Room(501, "Tiêu chuẩn", 5, 1500000),
        new Room(502, "Tiêu chuẩn", 5, 1500000),
        new Room(503, "Cao cấp", 5, 3000000),
        new Room(504, "Cao cấp", 5, 3000000),
        new Room(505, "Tổng thống", 5, 10000000)
    ]
];