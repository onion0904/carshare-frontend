export const MOCK_USERS = [
  {
    id: "user-1",
    firstName: "太郎",
    lastName: "田中",
    email: "taro@example.com",
    icon: "/placeholder.svg?height=64&width=64",
    avatarId: 1,
    name: "田中 太郎", // nameプロパティを追加
  },
  {
    id: "user-2",
    firstName: "花子",
    lastName: "佐藤",
    email: "hanako@example.com",
    icon: "/placeholder.svg?height=64&width=64",
    avatarId: 2,
    name: "佐藤 花子", // nameプロパティを追加
  },
  {
    id: "user-3",
    firstName: "次郎",
    lastName: "鈴木",
    email: "jiro@example.com",
    icon: "/placeholder.svg?height=64&width=64",
    avatarId: 3,
    name: "鈴木 次郎", // nameプロパティを追加
  },
]

export const MOCK_GROUPS = [
  {
    id: "group-1",
    name: "大学サークル",
    members: [
      {
        id: MOCK_USERS[0].id,
        name: MOCK_USERS[0].name,
        avatarId: MOCK_USERS[0].avatarId,
      },
      {
        id: MOCK_USERS[1].id,
        name: MOCK_USERS[1].name,
        avatarId: MOCK_USERS[1].avatarId,
      },
      {
        id: MOCK_USERS[2].id,
        name: MOCK_USERS[2].name,
        avatarId: MOCK_USERS[2].avatarId,
      },
    ],
    inviteCode: "ABC123",
  },
  {
    id: "group-2",
    name: "友達グループ",
    members: [
      {
        id: MOCK_USERS[0].id,
        name: MOCK_USERS[0].name,
        avatarId: MOCK_USERS[0].avatarId,
      },
      {
        id: MOCK_USERS[1].id,
        name: MOCK_USERS[1].name,
        avatarId: MOCK_USERS[1].avatarId,
      },
    ],
    inviteCode: "DEF456",
  },
]

export const MOCK_CARS = [
  {
    id: "car-1",
    name: "トヨタ",
    model: "プリウス",
    year: 2020,
    licensePlate: "品川 500 あ 1234",
    location: "東京都渋谷区",
    pricePerDay: 5000,
    available: true,
    imageUrl: "/placeholder.svg?height=200&width=300",
    owner: MOCK_USERS[0],
  },
  {
    id: "car-2",
    name: "ホンダ",
    model: "フィット",
    year: 2019,
    licensePlate: "品川 500 あ 5678",
    location: "東京都新宿区",
    pricePerDay: 4000,
    available: true,
    imageUrl: "/placeholder.svg?height=200&width=300",
    owner: MOCK_USERS[1],
  },
  {
    id: "car-3",
    name: "日産",
    model: "ノート",
    year: 2021,
    licensePlate: "品川 500 あ 9012",
    location: "東京都池袋区",
    pricePerDay: 4500,
    available: false,
    imageUrl: "/placeholder.svg?height=200&width=300",
    owner: MOCK_USERS[2],
  },
]

export const MOCK_RESERVATIONS = [
  {
    id: "reservation-1",
    startDate: "2024-01-20T09:00:00Z",
    endDate: "2024-01-20T18:00:00Z",
    totalPrice: 5000,
    status: "CONFIRMED",
    car: MOCK_CARS[0],
    user: MOCK_USERS[0],
  },
  {
    id: "reservation-2",
    startDate: "2024-01-22T10:00:00Z",
    endDate: "2024-01-22T16:00:00Z",
    totalPrice: 4000,
    status: "PENDING",
    car: MOCK_CARS[1],
    user: MOCK_USERS[1],
  },
]

export const MOCK_EVENTS = [
  {
    id: "event-1",
    title: "大学へ通学",
    startTime: "2024-01-20T08:00:00Z",
    endTime: "2024-01-20T18:00:00Z",
    isImportant: true,
    isCommute: true,
    note: "朝の授業があるので早めに出発します",
    userId: "user-1",
    userName: "田中 太郎",
    userAvatarId: 1,
    groupId: "group-1",
  },
  {
    id: "event-2",
    title: "買い物",
    startTime: "2024-01-21T14:00:00Z",
    endTime: "2024-01-21T17:00:00Z",
    isImportant: false,
    isCommute: false,
    note: "週末の買い物に使用",
    userId: "user-2",
    userName: "佐藤 花子",
    userAvatarId: 2,
    groupId: "group-1",
  },
  {
    id: "event-3",
    title: "病院",
    startTime: "2024-01-22T10:00:00Z",
    endTime: "2024-01-22T12:00:00Z",
    isImportant: true,
    isCommute: false,
    note: "定期検診のため",
    userId: "user-3",
    userName: "鈴木 次郎",
    userAvatarId: 3,
    groupId: "group-1",
  },
]

export const MOCK_USER_STATS = {
  totalCars: 2,
  totalReservations: 5,
  upcomingReservations: 2,
}
