.PHONY: all dev static fs clean

OBJS := manifest.xml static-manifest.xml gallery.xhtml index.html index.atom

all: dev

manifest.xml: gallery.xml ../manifest.xsl
	xsltproc ../manifest.xsl gallery.xml > manifest.xml

static-manifest.xml: manifest.xml
	xsltproc --param rooted true\(\) \
	         ../demo-lib/static-manifest.xsl manifest.xml > static-manifest.xml

gallery.xhtml: gallery.xml ../xhtml.xsl
	xsltproc ../xhtml.xsl gallery.xml > gallery.xhtml

index.html: static-manifest.xml gallery.xhtml ../gallery.xsl
	xsltproc ../gallery.xsl static-manifest.xml > index.html

index.atom: gallery.xml ../atom.xsl
	xsltproc ../atom.xsl gallery.xml > index.atom

fs: gallery.xml ../fs.xsl
	xsltproc ../fs.xsl gallery.xml | sh

dev: fs static-manifest.xml index.html index.atom
	xsltproc --stringparam profile dev \
	         ../demo-lib/local-assets.xsl static-manifest.xml | uniq | sh

static: fs static-manifest.xml index.html index.atom
	xsltproc --stringparam profile static \
	         ../demo-lib/local-assets.xsl static-manifest.xml | uniq | sh

clean: static-manifest.xml
	xsltproc --stringparam action delete \
	         ../demo-lib/local-assets.xsl static-manifest.xml | uniq | sh
	xsltproc --stringparam action delete \
	         ../fs.xsl gallery.xml | sh
	rm -f ${OBJS}

