import { MOCK_USERS, MOCK_GROUPS, MOCK_CARS, MOCK_RESERVATIONS, MOCK_EVENTS, MOCK_USER_STATS } from "./mock-data"

// モックデータのストレージ（実際のアプリではlocalStorageやstateで管理）
const mockStorage = {
  users: [...MOCK_USERS],
  groups: [...MOCK_GROUPS],
  cars: [...MOCK_CARS],
  reservations: [...MOCK_RESERVATIONS],
  events: [...MOCK_EVENTS],
  currentUser: MOCK_USERS[0],
}

// ランダムなIDを生成
const generateId = () => `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// 遅延をシミュレート
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

export async function executeMockGraphQL<T>(query: string, variables?: any): Promise<T> {
  try {
    await delay() // APIの遅延をシミュレート

    console.log("🔄 Mock GraphQL Request:", {
      query: query.replace(/\s+/g, " ").trim(),
      variables,
      currentUser: mockStorage.currentUser.id,
      timestamp: new Date().toISOString(),
    })

    // クエリの種類を判定して適切なレスポンスを返す
    if (query.includes("GetCurrentUser") || query.includes("me {")) {
      const result = { me: mockStorage.currentUser }
      console.log("✅ Mock Response (GetCurrentUser):", result)
      return result as T
    }

    if (query.includes("Login")) {
      const result = {
        login: {
          token: "mock-token-" + Date.now(),
          user: mockStorage.currentUser,
        },
      }
      console.log("✅ Mock Response (Login):", result)
      return result as T
    }

    if (query.includes("SendVerificationCode")) {
      const result = { sendVerificationCode: true }
      console.log("✅ Mock Response (SendVerificationCode):", result)
      return result as T
    }

    if (query.includes("Signup")) {
      const newUser = {
        id: generateId(),
        firstName: variables?.input?.firstName || "新規",
        lastName: variables?.input?.lastName || "ユーザー",
        email: variables?.input?.email || "new@example.com",
        icon: variables?.input?.icon || "/placeholder.svg?height=64&width=64",
        avatarId: 1,
        name: `${variables?.input?.lastName || "新規"} ${variables?.input?.firstName || "ユーザー"}`,
      }
      mockStorage.users.push(newUser)
      mockStorage.currentUser = newUser

      const result = {
        signup: {
          token: "mock-token-" + Date.now(),
          User: newUser,
        },
      }
      console.log("✅ Mock Response (Signup):", result)
      return result as T
    }

    if (query.includes("GetMyGroups") || query.includes("myGroups")) {
      // 現在のユーザーが参加しているグループを返す
      const userGroups = mockStorage.groups.filter((group) =>
        group.members.some((member) => member.id === mockStorage.currentUser.id),
      )

      // グループデータを簡略化（カレンダーページ用）
      const simplifiedGroups = userGroups.map((group) => ({
        id: group.id,
        name: group.name,
      }))

      const result = { myGroups: simplifiedGroups }
      console.log("✅ Mock Response (GetMyGroups):", {
        currentUserId: mockStorage.currentUser.id,
        totalGroups: mockStorage.groups.length,
        userGroups: userGroups.length,
        simplifiedGroups,
      })
      return result as T
    }

    if (query.includes("CreateGroup")) {
      const currentUserMember = {
        id: mockStorage.currentUser.id,
        name:
          mockStorage.currentUser.name || `${mockStorage.currentUser.lastName} ${mockStorage.currentUser.firstName}`,
        avatarId: mockStorage.currentUser.avatarId || 1,
      }

      const newGroup = {
        id: generateId(),
        name: variables?.input?.name || "新しいグループ",
        members: [currentUserMember],
        inviteCode: Math.random().toString(36).substr(2, 6).toUpperCase(),
      }
      mockStorage.groups.push(newGroup)

      const result = { createGroup: newGroup }
      console.log("✅ Mock Response (CreateGroup):", result)
      return result as T
    }

    if (query.includes("JoinGroup")) {
      const group = mockStorage.groups.find((g) => g.inviteCode === variables?.input?.inviteCode)
      if (group && !group.members.find((m) => m.id === mockStorage.currentUser.id)) {
        const currentUserMember = {
          id: mockStorage.currentUser.id,
          name:
            mockStorage.currentUser.name || `${mockStorage.currentUser.lastName} ${mockStorage.currentUser.firstName}`,
          avatarId: mockStorage.currentUser.avatarId || 1,
        }
        group.members.push(currentUserMember)
        const result = { joinGroup: group }
        console.log("✅ Mock Response (JoinGroup):", result)
        return result as T
      }
      if (!group) {
        console.log("❌ Mock Error (JoinGroup): Invalid invite code")
        throw new Error("無効な招待コードです")
      }
      const result = { joinGroup: group }
      console.log("✅ Mock Response (JoinGroup - already member):", result)
      return result as T
    }

    if (query.includes("GetGroupByInviteCode")) {
      const group = mockStorage.groups.find((g) => g.inviteCode === variables?.inviteCode)
      const result = { groupByInviteCode: group }
      console.log("✅ Mock Response (GetGroupByInviteCode):", result)
      return result as T
    }

    if (query.includes("GetGroupEvents") || query.includes("groupEvents")) {
      const groupId = variables?.input?.groupId
      console.log("🔍 Searching events for group:", groupId)
      console.log(
        "📊 Available events:",
        mockStorage.events.map((e) => ({ id: e.id, title: e.title, groupId: e.groupId })),
      )

      const groupEvents = mockStorage.events.filter((e) => e.groupId === groupId)
      const result = { groupEvents }
      console.log("✅ Mock Response (GetGroupEvents):", {
        requestedGroupId: groupId,
        foundEvents: groupEvents.length,
        events: groupEvents.map((e) => ({ id: e.id, title: e.title, startTime: e.startTime })),
      })
      return result as T
    }

    if (query.includes("CreateEvent")) {
      console.log("🎯 Mock CreateEvent: Processing event creation", {
        variables,
        groupId: variables?.input?.groupId,
        title: variables?.input?.title,
      })

      if (!variables?.input?.groupId) {
        console.error("❌ Mock CreateEvent: Missing groupId")
        throw new Error("グループIDが指定されていません")
      }

      if (!variables?.input?.title) {
        console.error("❌ Mock CreateEvent: Missing title")
        throw new Error("タイトルが指定されていません")
      }

      const newEvent = {
        id: generateId(),
        title: variables.input.title,
        startTime: variables.input.startTime,
        endTime: variables.input.endTime,
        isImportant: variables.input.isImportant || false,
        isCommute: variables.input.isCommute || false,
        note: variables.input.note || "",
        userId: mockStorage.currentUser.id,
        userName:
          mockStorage.currentUser.name || `${mockStorage.currentUser.lastName} ${mockStorage.currentUser.firstName}`,
        userAvatarId: mockStorage.currentUser.avatarId || 1,
        groupId: variables.input.groupId,
      }

      mockStorage.events.push(newEvent)

      const result = { createEvent: newEvent }
      console.log("✅ Mock Response (CreateEvent):", {
        newEvent,
        totalEvents: mockStorage.events.length,
        eventsForGroup: mockStorage.events.filter((e) => e.groupId === variables.input.groupId).length,
      })
      return result as T
    }

    if (query.includes("DeleteEvent")) {
      const eventIndex = mockStorage.events.findIndex((e) => e.id === variables?.id)
      if (eventIndex > -1) {
        mockStorage.events.splice(eventIndex, 1)
      }
      const result = { deleteEvent: true }
      console.log("✅ Mock Response (DeleteEvent):", result)
      return result as T
    }

    // 他のクエリも同様に処理...
    if (query.includes("GetAvailableCars") || query.includes("cars(")) {
      const availableCars = mockStorage.cars.filter((car) => variables?.filter?.available !== false || car.available)
      const result = { cars: availableCars }
      console.log("✅ Mock Response (GetAvailableCars):", result)
      return result as T
    }

    if (query.includes("GetCar") && variables?.id) {
      const car = mockStorage.cars.find((c) => c.id === variables.id)
      const result = { car }
      console.log("✅ Mock Response (GetCar):", result)
      return result as T
    }

    if (query.includes("CreateCar")) {
      const newCar = {
        id: generateId(),
        name: variables?.input?.name || "新しい車",
        model: variables?.input?.model || "モデル",
        year: variables?.input?.year || 2023,
        licensePlate: variables?.input?.licensePlate || "品川 500 あ 0000",
        location: variables?.input?.location || "東京都",
        pricePerDay: variables?.input?.pricePerDay || 5000,
        available: true,
        imageUrl: variables?.input?.imageUrl || "/placeholder.svg?height=200&width=300",
        owner: mockStorage.currentUser,
      }
      mockStorage.cars.push(newCar)
      const result = { createCar: newCar }
      console.log("✅ Mock Response (CreateCar):", result)
      return result as T
    }

    if (query.includes("CreateReservation")) {
      const car = mockStorage.cars.find((c) => c.id === variables?.input?.carId)
      const startDate = new Date(variables?.input?.startDate)
      const endDate = new Date(variables?.input?.endDate)
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      const totalPrice = car ? car.pricePerDay * days : 0

      const newReservation = {
        id: generateId(),
        startDate: variables?.input?.startDate,
        endDate: variables?.input?.endDate,
        totalPrice,
        status: "CONFIRMED",
        car,
        user: mockStorage.currentUser,
      }
      mockStorage.reservations.push(newReservation)
      const result = { createReservation: newReservation }
      console.log("✅ Mock Response (CreateReservation):", result)
      return result as T
    }

    if (query.includes("GetReservations") || query.includes("myReservations")) {
      const userReservations = mockStorage.reservations.filter((r) => r.user.id === mockStorage.currentUser.id)
      const carReservations = mockStorage.reservations.filter((r) =>
        mockStorage.cars.some((c) => c.id === r.car.id && c.owner.id === mockStorage.currentUser.id),
      )
      const result = {
        myReservations: userReservations,
        carReservations: carReservations,
      }
      console.log("✅ Mock Response (GetReservations):", result)
      return result as T
    }

    if (query.includes("CancelReservation")) {
      const reservation = mockStorage.reservations.find((r) => r.id === variables?.id)
      if (reservation) {
        reservation.status = "CANCELLED"
      }
      const result = { cancelReservation: reservation }
      console.log("✅ Mock Response (CancelReservation):", result)
      return result as T
    }

    if (query.includes("GetDashboardData")) {
      const userCars = mockStorage.cars.filter((c) => c.owner.id === mockStorage.currentUser.id)
      const userReservations = mockStorage.reservations.filter((r) => r.user.id === mockStorage.currentUser.id)

      const result = {
        userStats: MOCK_USER_STATS,
        myCars: userCars.slice(0, 3),
        myReservations: userReservations.slice(0, 3),
      }
      console.log("✅ Mock Response (GetDashboardData):", result)
      return result as T
    }

    if (query.includes("UpdateProfile")) {
      console.log("🔧 Mock UpdateProfile: Processing profile update", {
        variables,
        currentUser: mockStorage.currentUser,
        input: variables?.input,
      })

      if (!variables?.input) {
        console.error("❌ Mock UpdateProfile: Missing input")
        throw new Error("更新データが指定されていません")
      }

      const updatedUser = {
        ...mockStorage.currentUser,
        firstName: variables.input.firstName || mockStorage.currentUser.firstName,
        lastName: variables.input.lastName || mockStorage.currentUser.lastName,
        icon: variables.input.icon || mockStorage.currentUser.icon,
        name: `${variables.input.lastName || mockStorage.currentUser.lastName} ${variables.input.firstName || mockStorage.currentUser.firstName}`,
      }

      // ストレージ内のユーザー情報を更新
      mockStorage.currentUser = updatedUser

      // users配列内の該当ユーザーも更新
      const userIndex = mockStorage.users.findIndex((u) => u.id === mockStorage.currentUser.id)
      if (userIndex > -1) {
        mockStorage.users[userIndex] = updatedUser
      }

      const result = { updateProfile: updatedUser }
      console.log("✅ Mock Response (UpdateProfile):", {
        updatedUser,
        result,
        storageUpdated: true,
      })
      return result as T
    }

    // デフォルトレスポンス
    console.warn("⚠️ Unhandled mock query:", {
      query: query.replace(/\s+/g, " ").trim(),
      variables,
      availableHandlers: [
        "GetCurrentUser",
        "Login",
        "SendVerificationCode",
        "Signup",
        "GetMyGroups",
        "CreateGroup",
        "JoinGroup",
        "GetGroupByInviteCode",
        "GetGroupEvents",
        "CreateEvent",
        "DeleteEvent",
        "GetAvailableCars",
        "GetCar",
        "CreateCar",
        "CreateReservation",
        "GetReservations",
        "CancelReservation",
        "GetDashboardData",
        "UpdateProfile",
      ],
    })

    // 空のレスポンスを返す代わりに、適切なデフォルト値を返す
    if (query.includes("myGroups")) {
      return { myGroups: [] } as T
    }
    if (query.includes("groupEvents")) {
      return { groupEvents: [] } as T
    }

    return {} as T
  } catch (error) {
    console.error("❌ Mock GraphQL Error:", error)
    throw error
  }
}
