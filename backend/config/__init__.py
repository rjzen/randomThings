import pymysql

# Install PyMySQL as MySQLdb
pymysql.install_as_MySQLdb()

# Patch version to satisfy Django's requirement
pymysql.version_info = (2, 2, 1, "final", 0)

# Optional: Disable strict mode warnings
import warnings
warnings.filterwarnings("ignore", category=pymysql.Warning)