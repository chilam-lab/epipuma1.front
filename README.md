# SPECIES FrontEnd

Species FrontEnd is a HTML+JS webapp, this app can be served as a static
website but it will need an instance of the
[SNIB middleware](https://bitbucket.org/conabio_c3/snib-middleware/).

## Configuration

Before deploy SPECIES FrontEnd, it is necessary to edit the
`javascript/config.js` file. There are two variables ths should be
modified with the corresponding values:

- `url_front`, URL for the current app deployment

- `url_api`, URL where SNIB middleware is answering

## Local running

One way to run locally the SPECIES FrontEnd is using the Python simple
HTTP Server. After clone this repository and configure the values for
`url_front` and `url_api` on `javascript/config.js` file, execute
next commands:

```x-sh
$ cd species-front
$ python -m http.server
```

Then open a browser and the application must be runnning on
http://localhost:8000.
