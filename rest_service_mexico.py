# import requests
try:
    import json
except:
    print 'Unable to find json. Make sure you have downloaded json module.' 

from geoserver.catalog import Catalog
import sys
import argparse

# cat = Catalog("http://localhost:8080/geoserver/rest/", "admin", "geoserver")

# # recibiendo argumentos
parser = argparse.ArgumentParser()
parser.add_argument('url')
parser.add_argument('user')
parser.add_argument('password')
parser.add_argument('style')
parser.add_argument('file')

args      = parser.parse_args()
rest_url    = args.url
user    = args.user
password    = args.password
id_Style    = args.style
json_file = json.loads(args.file)

# print "sld_file: ", json_file


sld_file =  '<?xml version="1.0" encoding="ISO-8859-1"?> \n' \
            '<StyledLayerDescriptor version="1.0.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"> \n' \
            '<NamedLayer> \n' \
              '\t<Name>sp_grid_local</Name> \n' \
              '\t<UserStyle> \n' \
                '\t\t<Name>sp_grid_local</Name> \n'

# ************************* celdas relacionadas
i = 0

for item in json_file:

    first = item["arg_gridid"]

    if len(item["arg_gridid"]) == 0 or first[0] == None:
        continue

    sld_file += '\t\t<FeatureTypeStyle> \n' \
                '\t\t\t<Rule> \n' \
                  "\t<Name>custom cell " + str(i) +  "</Name> \n" \
                    '\t\t<ogc:Filter> \n'

    # if len(item["arg_gridid"]) > 1:
    # sld_file += '\t\t\t<ogc:Or> \n'
    
    str_ids = "-"
    for ids in item["arg_gridid"]:
        str_ids += str(ids) + "-"

    sld_file += '<ogc:And> \n' \
        '<ogc:PropertyIsEqualTo> \n' \
          '<ogc:Function name="strSubstring"> \n' \
            '<ogc:Literal>' + str_ids + '</ogc:Literal> \n' \
              '<ogc:Function name="strIndexOf"> \n' \
                '<ogc:Literal>' + str_ids + '</ogc:Literal> \n' \
                '<ogc:PropertyName>gridid</ogc:PropertyName>  \n' \
              '</ogc:Function> \n' \
                '<ogc:Add> \n' \
                  '<ogc:Function name="strIndexOf"> \n' \
                      '<ogc:Function name="strSubstringStart"> \n' \
                          '<ogc:Literal>' + str_ids + '</ogc:Literal> \n' \
                          '<ogc:Function name="strIndexOf"> \n' \
                            '<ogc:Literal>' + str_ids + '</ogc:Literal> \n' \
                            '<ogc:PropertyName>gridid</ogc:PropertyName>  \n' \
                          '</ogc:Function> \n' \
                      '</ogc:Function> \n' \
                      '<ogc:Literal>-</ogc:Literal> \n' \
                  '</ogc:Function> \n' \
                  '<ogc:Function name="strIndexOf"> \n' \
                    '<ogc:Literal>' + str_ids + '</ogc:Literal> \n' \
                    '<ogc:PropertyName>gridid</ogc:PropertyName>  \n' \
                  '</ogc:Function> \n' \
                '</ogc:Add> \n' \
          '</ogc:Function> \n' \
          '<ogc:PropertyName>gridid</ogc:PropertyName>  \n' \
        '</ogc:PropertyIsEqualTo> \n' \
        '<ogc:PropertyIsEqualTo> \n' \
          '<ogc:Function name="strSubstring"> \n' \
            '<ogc:Literal>' + str_ids + '</ogc:Literal> \n' \
            '<ogc:Sub> \n' \
              '<ogc:Function name="strIndexOf"> \n' \
                '<ogc:Literal>' + str_ids + '</ogc:Literal> \n' \
                '<ogc:PropertyName>gridid</ogc:PropertyName>  \n' \
              '</ogc:Function> \n' \
              '<ogc:Literal>1</ogc:Literal> \n' \
            '</ogc:Sub> \n' \
            '<ogc:Function name="strIndexOf"> \n' \
              '<ogc:Literal>' + str_ids + '</ogc:Literal> \n' \
              '<ogc:PropertyName>gridid</ogc:PropertyName>  \n' \
            '</ogc:Function> \n' \
          '</ogc:Function> \n' \
          '<ogc:Literal>-</ogc:Literal> \n' \
        '</ogc:PropertyIsEqualTo> \n' \
      '</ogc:And>'

        # sld_file +=   '\t\t\t\t<ogc:PropertyIsEqualTo> \n' \
        #                 '\t\t\t\t\t<ogc:PropertyName>gridid</ogc:PropertyName> \n' \
        #                 "\t\t\t\t\t<ogc:Literal>"+ str(ids) +"</ogc:Literal> \n" \
        #             '\t\t\t\t</ogc:PropertyIsEqualTo> \n' 

    
    # if len(item["arg_gridid"]) > 1:
    # sld_file += '\t\t\t</ogc:And> \n'

    sld_file += '\t\t</ogc:Filter> \n' \
              '\t\t<PolygonSymbolizer> \n' \
                '\t\t\t<Fill> \n' \
                  "\t\t\t\t<CssParameter name='fill'>" + str(item["color"])  + "</CssParameter>  \n" \
                  '\t\t\t\t<CssParameter name="fill-opacity">1</CssParameter>  \n' \
                '\t\t\t</Fill> \n' \
              '\t\t</PolygonSymbolizer> \n' \
            '\t\t</Rule> \n' \
          '\t\t\t</FeatureTypeStyle> \n'
    i = i + 1

sld_file +=  '\t</UserStyle> \n' \
            '\t</NamedLayer> \n' \
        '</StyledLayerDescriptor>'




cat = Catalog(rest_url,user,password)
cat.create_style(id_Style, sld_file, overwrite=True)

# '\t\t\t\t<CssParameter name="fill-opacity">0.84</CssParameter>  \n' \

 # '\t\t\t<Stroke> \n' \
                #   '\t\t\t\t<CssParameter name="stroke">#000000</CssParameter> \n' \
                #   '\t\t\t\t<CssParameter name="stroke-width">0.66</CssParameter>  \n' \
                #   '\t\t\t\t<CssParameter name="stroke-linejoin">bevel</CssParameter> \n' \
                # '\t\t\t</Stroke> \n' \

'''

'\t\t\t<Stroke> \n' \
  '\t\t\t\t<CssParameter name="stroke">#000000</CssParameter> \n' \
  '\t\t\t\t<CssParameter name="stroke-width">0.66</CssParameter>  \n' \
  '\t\t\t\t<CssParameter name="stroke-linejoin">bevel</CssParameter> \n' \
'\t\t\t</Stroke> \n' \

<ogc:And>

  <ogc:PropertyIsEqualTo>

    <ogc:Function name="strSubstring">
      <ogc:Literal>-9179-7823-7268-</ogc:Literal>

        <ogc:Function name="strIndexOf">
          <ogc:Literal>-9179-7823-7268-</ogc:Literal>
          <ogc:PropertyName>gridid</ogc:PropertyName>            
        </ogc:Function>
        <!-- (7) -->

          <ogc:Add>

            <ogc:Function name="strIndexOf">
                <ogc:Function name="strSubstringStart">
                    <ogc:Literal>-9179-7823-7268-</ogc:Literal>
                    <ogc:Function name="strIndexOf">
                      <ogc:Literal>-9179-7823-7268-</ogc:Literal>
                      <ogc:PropertyName>gridid</ogc:PropertyName> 
                      <!-- (823) -->
                    </ogc:Function>
                    <!-- (7) -->
                </ogc:Function>
                <!-- (823-7268-) -->
                <ogc:Literal>-</ogc:Literal>
            </ogc:Function>
            <!-- (3) este numero no varia ya q se toma de la subcadena, es la longitud del numero -->

            <ogc:Function name="strIndexOf">
              <ogc:Literal>-9179-7823-7268-</ogc:Literal>
              <ogc:PropertyName>gridid</ogc:PropertyName> 
            </ogc:Function>
            <!-- (7) -->
          </ogc:Add>
          <!-- (10) -->   
    </ogc:Function>

    <ogc:PropertyName>gridid</ogc:PropertyName> 

  </ogc:PropertyIsEqualTo>

  <ogc:PropertyIsEqualTo>

    <ogc:Function name="strSubstring">

      <ogc:Literal>-9179-7823-7268-</ogc:Literal>
      
      <ogc:Sub>
        <ogc:Function name="strIndexOf">
          <ogc:Literal>-9179-7823-7268-</ogc:Literal>
          <ogc:PropertyName>gridid</ogc:PropertyName> 
        </ogc:Function>
        <!-- (6) -->
        <ogc:Literal>1</ogc:Literal>
      </ogc:Sub>
      <!-- (5) -->

      <ogc:Function name="strIndexOf">
        <ogc:Literal>-9179-7823-7268-</ogc:Literal>
        <ogc:PropertyName>gridid</ogc:PropertyName> 
      </ogc:Function>
      <!-- (6) -->
    </ogc:Function>

    <ogc:Literal>-</ogc:Literal>
  </ogc:PropertyIsEqualTo>

</ogc:And>











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


