.PHONY: all static clean

all: index.html static

static-manifest.xml: manifest.xml
	xsltproc ../demo-lib/static-manifest.xsl manifest.xml > static-manifest.xml

index.html: static-manifest.xml
	xsltproc ../gallery.xsl static-manifest.xml > index.html

static: static-manifest.xml
	xsltproc ../demo-lib/static-assets.xsl static-manifest.xml | uniq | sh

clean:
	rm static-manifest.xml index.html