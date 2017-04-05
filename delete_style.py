from geoserver.catalog import Catalog
import sys

# recibiendo argumentos
rest_url = str(sys.argv[1])
user = str(sys.argv[2])
password = str(sys.argv[3])
id_Style = str(sys.argv[4])

cat = Catalog(rest_url,user,password)
style = cat.get_style(id_Style)
cat.delete(style)