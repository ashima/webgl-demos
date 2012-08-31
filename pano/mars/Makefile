.PHONY: all static clean

OBJS := manifest.xml static-manifest.xml gallery.xhtml index.html index.atom

all: index.html index.atom static

manifest.xml: gallery.xml
	xsltproc ../manifest.xsl gallery.xml > manifest.xml

static-manifest.xml: manifest.xml
	xsltproc --param rooted true\(\) \
	         ../demo-lib/static-manifest.xsl manifest.xml > static-manifest.xml

gallery.xhtml: gallery.xml
	xsltproc ../xhtml.xsl gallery.xml > gallery.xhtml

index.html: static-manifest.xml gallery.xhtml
	xsltproc ../gallery.xsl static-manifest.xml > index.html

index.atom: gallery.xml
	xsltproc ../atom.xsl gallery.xml > index.atom

static: static-manifest.xml
	xsltproc ../demo-lib/local-assets.xsl static-manifest.xml | uniq | sh
	xsltproc ../fs.xsl gallery.xml | sh

clean: static-manifest.xml
	xsltproc --stringparam action delete \
	         ../demo-lib/local-assets.xsl static-manifest.xml | uniq | sh
	xsltproc --stringparam action delete \
	         ../fs.xsl gallery.xml | sh
	rm -f ${OBJS}

