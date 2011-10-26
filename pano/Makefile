.PHONY: all static clean

all: static

static:
	xsltproc demo-lib/static-manifest.xsl pano.html | xsltproc demo-lib/static-assets.xsl - | uniq | sh
