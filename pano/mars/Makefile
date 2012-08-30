.PHONY: all static clean

OBJS := manifest.xml static-manifest.xml gallery.html index.html index.atom

all: index.html index.atom static

manifest.xml: gallery.xml
	xsltproc ../manifest.xsl gallery.xml > manifest.xml

static-manifest.xml: manifest.xml
	xsltproc ../demo-lib/static-manifest.xsl manifest.xml > static-manifest.xml

gallery.html: gallery.xml
	xsltproc ../xhtml.xsl gallery.xml > gallery.html

index.html: static-manifest.xml gallery.html
	xsltproc ../gallery.xsl static-manifest.xml > index.html

index.atom: gallery.xml
	xsltproc ../atom.xsl gallery.xml > index.atom

static: static-manifest.xml
	xsltproc ../demo-lib/local-assets.xsl static-manifest.xml | uniq | sh
	xsltproc ../fs.xsl gallery.xml | sh

clean:
	rm -f ${OBJS}
	xsltproc --stringparam action delete \
	         ../fs.xsl gallery.xml | sh
