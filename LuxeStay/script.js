let selectedRoom = null;

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

const bookingSystem = new BookingSystem();

bookingSystem.bookingHistory = JSON.parse(localStorage.getItem("bookingHistory")) || [];

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

const bookedRooms =
    JSON.parse(localStorage.getItem("bookedRooms")) || [];

hotelMatrix.forEach(floor => {
    floor.forEach(room => {
        if (bookedRooms.includes(room.id)) {
            room.book();
        }
    });
});

function renderHotelMap() {
    const container = document.getElementById("hotelMap");
    container.innerHTML = "";

    hotelMatrix.forEach(floor => {
        const floorDiv = document.createElement("div");
        floor.forEach(room => {
            const roomDiv = document.createElement("div");

            roomDiv.innerHTML = `
                <div>${room.id}</div>
                <div class="room-star">${getStars(room.basePrice)}</div>
            `;

            roomDiv.className = room.isBooked ? "bg-red" : "bg-green";
            if (room === selectedRoom) {
                roomDiv.classList.add(
                    "selected-room"
                );
            }
            roomDiv.addEventListener("click", function () {
                if (room.isBooked) {
                    message.textContent = "Phòng này đã được đặt!";
                    return;
                }
                selectedRoom = room;
                renderHotelMap();
                message.textContent = `Đã chọn phòng ${room.id} giá ${room.basePrice.toLocaleString('vi-VN')} VND`;
            });
            floorDiv.appendChild(roomDiv);
        });
        container.appendChild(floorDiv);
    });
}

function getStars(price) {
    if (price <= 1500000) return "⭐";
    if (price <= 3000000) return "⭐⭐";
    return "⭐⭐⭐";
}

bookingForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const name = customerName.value.trim();
    const phone = customerPhone.value.trim();

    if (!name || !phone) {
        message.textContent = "Vui lòng nhập đủ thông tin";
        return;
    }

    const phoneRegex = /^0\d{9}$/;

    if (!phoneRegex.test(phone)) {
        message.textContent =
            "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0";
        return;
    }

    if (!selectedRoom) {
        message.textContent = "Vui lòng chọn phòng";
        return;
    }

    const invoice = {
        customerName: name,
        customerPhone: phone,
        room: {
            id: selectedRoom.id,
            type: selectedRoom.type,
            floor: selectedRoom.floor,
            basePrice: selectedRoom.basePrice
        },
        bookingDate: new Date().toLocaleString()
    };

    bookingSystem.bookingHistory.push(invoice);
    localStorage.setItem("bookingHistory", JSON.stringify(bookingSystem.bookingHistory));
    renderHistory();

    selectedRoom.book();
    saveBookedRooms();
    message.textContent = `Đặt phòng ${selectedRoom.id} thành công`;
    console.log(bookingSystem.bookingHistory);
    customerName.value = "";
    customerPhone.value = "";
    selectedRoom = null;
    renderHotelMap();
});

function renderHistory() {
    const tbody = document.getElementById("historyBody");
    tbody.innerHTML = "";

    bookingSystem.bookingHistory.forEach(item => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${item.customerName}</td>
            <td>${item.room.id}</td>
            <td>${item.room.basePrice}</td>
        `;

        tbody.appendChild(tr);
    });
}

function saveBookedRooms() {
    const bookedIds = [];

    hotelMatrix.forEach(floor => {
        floor.forEach(room => {
            if (room.isBooked) {
                bookedIds.push(room.id);
            }
        });
    });

    localStorage.setItem("bookedRooms", JSON.stringify(bookedIds));
}

hotelMatrix[0][0].book(); // 101
hotelMatrix[0][2].book(); // 103
hotelMatrix[1][1].book(); // 202
hotelMatrix[1][4].book(); // 205
hotelMatrix[2][3].book(); // 304

renderHotelMap();
renderHistory();