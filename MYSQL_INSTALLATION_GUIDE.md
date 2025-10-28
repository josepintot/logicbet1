# MySQL Installation & Setup Guide for Logic Bet

This guide will walk you through installing and configuring MySQL for the Logic Bet application.

---

## Step 1: Install MySQL

### Windows

1. **Download MySQL Installer**
   - Go to https://dev.mysql.com/downloads/installer/
   - Download the Windows MySQL Installer (mysql-installer-web-community)
   
2. **Run the Installer**
   - Choose "Developer Default" setup type
   - Click "Next" through the installation wizard
   
3. **Configure MySQL Server**
   - Set a **root password** (write it down!)
   - Default port: **3306**
   - Configure as Windows Service (check "Start the MySQL Server at System Startup")
   
4. **Complete Installation**
   - Click "Execute" and "Finish"

### macOS

1. **Install Homebrew** (if not already installed)
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Install MySQL**
   ```bash
   brew install mysql
   ```

3. **Start MySQL**
   ```bash
   brew services start mysql
   ```

4. **Secure Installation** (Optional but recommended)
   ```bash
   mysql_secure_installation
   ```

### Linux (Ubuntu/Debian)

1. **Update Package Index**
   ```bash
   sudo apt update
   ```

2. **Install MySQL**
   ```bash
   sudo apt install mysql-server
   ```

3. **Start MySQL Service**
   ```bash
   sudo systemctl start mysql
   ```

4. **Secure Installation**
   ```bash
   sudo mysql_secure_installation
   ```

---

## Step 2: Create the Database

1. **Open MySQL Command Line**

   **Windows:**
   - Search for "MySQL Command Line Client" in Start Menu
   - Or open Command Prompt and type: `mysql -u root -p`

   **macOS/Linux:**
   ```bash
   mysql -u root -p
   ```

2. **Enter your root password** when prompted

3. **Create the Database**
   ```sql
   CREATE DATABASE logicbet;
   ```

4. **Create a User** (recommended for security)
   ```sql
   CREATE USER 'logicbet_user'@'localhost' IDENTIFIED BY 'YourSecurePassword123!';
   ```

5. **Grant Permissions**
   ```sql
   GRANT ALL PRIVILEGES ON logicbet.* TO 'logicbet_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

6. **Exit MySQL**
   ```sql
   EXIT;
   ```

---

## Step 3: Configure Environment Variables

1. **Create `.env` file** in your project root (if it doesn't exist)

2. **Add the following configuration:**
   ```env
   # MySQL Database Connection
   DATABASE_URL=mysql://logicbet_user:YourSecurePassword123!@localhost:3306/logicbet

   # Session Secret (change this to a random string)
   SESSION_SECRET=your-super-secret-random-key-change-this

   # Replit Auth (if using)
   ISSUER_URL=https://replit.com/oidc
   REPL_ID=your-repl-id
   ```

   **IMPORTANT:** Replace `YourSecurePassword123!` with the password you set earlier!

   **Alternative (if using root user):**
   ```env
   DATABASE_URL=mysql://root:YourRootPassword@localhost:3306/logicbet
   ```

---

## Step 4: Update Drizzle Config

**⚠️ IMPORTANT:** You MUST manually edit `drizzle.config.ts`

1. **Open** `drizzle.config.ts`

2. **Find line 10** and change:
   ```typescript
   dialect: "postgresql",
   ```
   
   **To:**
   ```typescript
   dialect: "mysql",
   ```

3. **Save the file**

---

## Step 5: Push Database Schema

This will create all the tables in your MySQL database:

```bash
npm run db:push
```

You should see output like:
```
✔ Everything is in sync 🚀
```

---

## Step 6: Seed the Database (Optional)

Add sample betting games to your database:

```bash
npx tsx server/seed.ts
```

This will create:
- 12 sample games across 5 sports
- Mix of live and upcoming games
- Realistic betting odds

---

## Step 7: Run the Application

Start the development server:

```bash
npm run dev
```

The application will be available at: **http://localhost:5000**

---

## Verify Your Installation

1. **Connect to MySQL**
   ```bash
   mysql -u logicbet_user -p logicbet
   ```

2. **Check Tables**
   ```sql
   SHOW TABLES;
   ```
   
   You should see:
   - `bets`
   - `games`
   - `sessions`
   - `users`

3. **View Sample Games**
   ```sql
   SELECT id, sport, homeTeam, awayTeam, status FROM games LIMIT 5;
   ```

4. **Exit**
   ```sql
   EXIT;
   ```

---

## Troubleshooting

### Issue: "Can't connect to MySQL server"

**Solution:**
- Check if MySQL is running
  - **Windows:** Press Win+R, type `services.msc`, find MySQL, click Start
  - **macOS:** `brew services start mysql`
  - **Linux:** `sudo systemctl start mysql`

### Issue: "Access denied for user"

**Solution:**
- Double-check your password in the `.env` file
- Make sure the user exists:
  ```sql
  SELECT User, Host FROM mysql.user;
  ```

### Issue: "Unknown database 'logicbet'"

**Solution:**
- Create the database:
  ```sql
  CREATE DATABASE logicbet;
  ```

### Issue: "Port 3306 already in use"

**Solution:**
- Another MySQL instance is running. Stop it or change the port in MySQL configuration
- Update your `DATABASE_URL` to use the new port (e.g., `:3307`)

### Issue: "Table doesn't exist"

**Solution:**
- Run the database push command:
  ```bash
  npm run db:push
  ```

---

## MySQL Management Tools (Optional)

For easier database management, consider installing one of these GUI tools:

1. **MySQL Workbench** (Official, Free)
   - Download: https://dev.mysql.com/downloads/workbench/
   - Best for: Windows, macOS, Linux

2. **TablePlus** (Modern, Free/Paid)
   - Download: https://tableplus.com/
   - Best for: macOS, Windows

3. **DBeaver** (Open Source, Free)
   - Download: https://dbeaver.io/
   - Best for: All platforms

4. **phpMyAdmin** (Web-based)
   - Setup: https://www.phpmyadmin.net/
   - Best for: Those who prefer web interfaces

---

## Common MySQL Commands

```sql
-- Show all databases
SHOW DATABASES;

-- Select a database
USE logicbet;

-- Show all tables
SHOW TABLES;

-- View table structure
DESCRIBE users;
DESCRIBE games;

-- View all games
SELECT * FROM games;

-- View only upcoming games
SELECT * FROM games WHERE status = 'upcoming';

-- Count games by sport
SELECT sport, COUNT(*) as count FROM games GROUP BY sport;

-- Delete all games (careful!)
DELETE FROM games;

-- Drop and recreate database (DANGER!)
DROP DATABASE logicbet;
CREATE DATABASE logicbet;
```

---

## Production Deployment Tips

For production deployment:

1. **Use strong passwords**
   - Generate with: `openssl rand -base64 32`

2. **Enable SSL** for MySQL connections

3. **Set up automated backups**
   ```bash
   mysqldump -u logicbet_user -p logicbet > backup_$(date +%Y%m%d).sql
   ```

4. **Consider managed MySQL services:**
   - **AWS RDS for MySQL**
   - **Google Cloud SQL**
   - **Azure Database for MySQL**
   - **PlanetScale** (MySQL-compatible)
   - **DigitalOcean Managed Databases**

5. **Update DATABASE_URL** for production:
   ```env
   DATABASE_URL=mysql://user:password@production-host:3306/logicbet?ssl={"rejectUnauthorized":true}
   ```

---

## Next Steps

1. ✅ MySQL installed and running
2. ✅ Database created
3. ✅ Environment variables configured
4. ✅ Schema pushed to database
5. ✅ Sample data seeded

**You're ready to go!** Visit http://localhost:5000 to see your Logic Bet application.

---

## Support & Resources

- **MySQL Documentation:** https://dev.mysql.com/doc/
- **Drizzle ORM Docs:** https://orm.drizzle.team/
- **MySQL Tutorial:** https://www.mysqltutorial.org/
- **Stack Overflow:** https://stackoverflow.com/questions/tagged/mysql

---

**Need help?** If you encounter any issues, double-check:
1. MySQL is running
2. Database `logicbet` exists
3. User has correct permissions
4. `.env` file has correct credentials
5. `drizzle.config.ts` is set to use `"mysql"` dialect
