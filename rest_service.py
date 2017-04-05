# import requests
from geoserver.catalog import Catalog
import sys
import json

# recibiendo argumentos

rest_url = str(sys.argv[1])
user = str(sys.argv[2])
password = str(sys.argv[3])
id_Style = str(sys.argv[4])
json_str = str(sys.argv[5])

json_file = json.loads(json_str)
# json_file = json.dumps(json_item)

# print parsed_json

sld_file =  '<?xml version="1.0" encoding="ISO-8859-1"?> \n' \
            '<StyledLayerDescriptor version="1.0.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"> \n' \
            '<NamedLayer> \n' \
              '\t<Name>sp_grid_local</Name> \n' \
              '\t<UserStyle> \n' \
                '\t\t<Name>sp_grid_local</Name> \n'

# ************************* celdas relacionadas

for item in json_file:

    # print item

    if item["gridids"] == None:
        continue

    sld_file += '\t\t<FeatureTypeStyle> \n' \
                '\t\t\t<Rule> \n' \
                  "\t<Name>custom cell " + str(item["bucket"]) +  "</Name> \n" \
                    '\t\t<ogc:Filter> \n'

    if len(item["gridids"]) > 1:
        sld_file += '\t\t\t<ogc:Or> \n'


    for gridid in item["gridids"]:

        sld_file +=   '\t\t\t\t<ogc:PropertyIsEqualTo> \n' \
                        '\t\t\t\t\t<ogc:PropertyName>gridid</ogc:PropertyName> \n' \
                        "\t\t\t\t\t<ogc:Literal>"+ str(gridid) +"</ogc:Literal> \n" \
                    '\t\t\t\t</ogc:PropertyIsEqualTo> \n' 

    argColor = item["colors"]
    hex_color = argColor[int(item["bucket"]) - 1]

    if len(item["gridids"]) > 1:
        sld_file += '\t\t\t</ogc:Or> \n'

    sld_file += '\t\t</ogc:Filter> \n' \
              '\t\t<PolygonSymbolizer> \n' \
                '\t\t\t<Fill> \n' \
                  "\t\t\t\t<CssParameter name='fill'>" + str(hex_color)  + "</CssParameter>  \n" \
                  '\t\t\t\t<CssParameter name="fill-opacity">0.84</CssParameter>  \n' \
                '\t\t\t</Fill> \n' \
                '\t\t\t<Stroke> \n' \
                  '\t\t\t\t<CssParameter name="stroke">#000000</CssParameter> \n' \
                  '\t\t\t\t<CssParameter name="stroke-width">0.66</CssParameter>  \n' \
                  '\t\t\t\t<CssParameter name="stroke-linejoin">bevel</CssParameter> \n' \
                '\t\t\t</Stroke> \n' \
              '\t\t</PolygonSymbolizer> \n' \
            '\t\t</Rule> \n' \
          '\t\t\t</FeatureTypeStyle> \n'


sld_file +=  '\t</UserStyle> \n' \
            '\t</NamedLayer> \n' \
        '</StyledLayerDescriptor>'

cat = Catalog(rest_url,user,password)
cat.create_style(id_Style, sld_file, overwrite=True)

# cat = Catalog("http://localhost:8083/geoserver/rest")
# that_layer = cat.get_layer("sp_grid_terrestre")
# that_layer.enabled = True
# that_layer._set_default_style("sp_grid_local"+str(millis))
# # that_layer._set_alternate_styles("sp_grid_local"+str(millis))
# cat.save(that_layer)


# print sld_file
'''
si funciona!! pero no tiene para mas de 10 elementos
<ogc:Filter>
 <ogc:PropertyIsEqualTo>
   <ogc:Function name="in3">
      <ogc:Function name="geometryType">
          <ogc:PropertyName>geom</ogc:PropertyName>
      </ogc:Function>
      <ogc:Literal>LineString</ogc:Literal>
      <ogc:Literal>LinearRing</ogc:Literal>
      <ogc:Literal>MultiLineString</ogc:Literal>
   </ogc:Function>
   <ogc:Literal>true</ogc:Literal>
 </ogc:PropertyIsEqualTo>
</ogc:Filter>

<ogc:Function name="strIndexOf">
            <ogc:PropertyName>gridid</ogc:PropertyName>
            <ogc:Literal>9179,7823,7268</ogc:Literal>
          </ogc:Function>

'''
# ************************* celdas no relacionadas
'''
sld_file += '\t\t<FeatureTypeStyle> \n' \
                '\t\t\t<Rule> \n' \
                  "\t<Name>custom zero cell </Name> \n" \
                    '\t\t<ogc:Filter> \n'

if len(item["gridids"]) > 1:
    sld_file += '\t\t\t<ogc:And> \n'

for item in json_file:

    for gridid in item["gridids"]:

        if gridid != "null":

            sld_file +=   '\t\t\t\t<ogc:PropertyIsNotEqualTo> \n' \
                          '\t\t\t\t\t<ogc:PropertyName>gridid</ogc:PropertyName> \n' \
                          "\t\t\t\t\t<ogc:Literal>"+ str(gridid) +"</ogc:Literal> \n" \
                      '\t\t\t\t</ogc:PropertyIsNotEqualTo> \n' 


if len(item["gridids"]) > 1:
    sld_file += '\t\t\t</ogc:And> \n'

sld_file +=  '\t\t</ogc:Filter> \n' \
            '\t\t<PolygonSymbolizer> \n' \
              '\t\t\t<Fill> \n' \
                "\t\t\t\t<CssParameter name='fill'>#000000</CssParameter>  \n" \
                '\t\t\t\t<CssParameter name="fill-opacity">0.00</CssParameter>  \n' \
              '\t\t\t</Fill> \n' \
              '\t\t\t<Stroke> \n' \
                '\t\t\t\t<CssParameter name="stroke">#000000</CssParameter> \n' \
                '\t\t\t\t<CssParameter name="stroke-width">0.66</CssParameter>  \n' \
                '\t\t\t\t<CssParameter name="stroke-linejoin">bevel</CssParameter> \n' \
              '\t\t\t</Stroke> \n' \
            '\t\t</PolygonSymbolizer> \n' \
          '\t\t</Rule> \n' \
        '\t\t\t</FeatureTypeStyle> \n' \
      '\t</UserStyle> \n' \
  '\t</NamedLayer> \n' \
'</StyledLayerDescriptor>'

print sld_file
'''



