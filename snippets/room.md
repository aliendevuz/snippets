# Room Setup

## Entity

```kotlin
@Entity(tableName = "user")
data class User(
  @PrimaryKey val id: Int,
  val name: String
)
```

## DAO

```kotlin
@Dao
interface UserDao {
  @Query("SELECT * FROM user") fun getAll(): List<User>
}
```

## Database

```kotlin
@Database(entities = [User::class], version = 1)
abstract class AppDatabase : RoomDatabase() {
  abstract fun userDao(): UserDao
}
```