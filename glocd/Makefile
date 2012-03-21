.PHONY: all noise

GLSL := $(wildcard *.glsl)
GLO := $(GLSL:.glsl=.glo)

all: ${GLO} noise

noise:
	cd ../webgl-noise/src && make
	cp ../webgl-noise/src/noise.glo .

%.glo: %.glsl
	gloc -c --dissolve $*.glsl -o $*.glo
