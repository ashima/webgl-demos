<?xml version="1.0"?>

<xsl:stylesheet version="1.0"
		xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:import href="subpath.xsl" />

  <xsl:param name="action" select="'create'" />

  <xsl:output method="text" indent="no" />

  <xsl:template match="gallery">
    <xsl:text>#!/bin/sh&#xA;&#xA;</xsl:text>
    <xsl:if test="$action='create'">
      <xsl:apply-templates select="section" mode="create" />
    </xsl:if>
    <xsl:if test="$action='delete'">
      <xsl:apply-templates select="section" mode="delete" />
    </xsl:if>
  </xsl:template>

  <xsl:template name="mkdir">
    <xsl:variable name="subpath">
      <xsl:call-template name="subpath" />
    </xsl:variable>
    <xsl:text>mkdir -p </xsl:text><xsl:value-of select="$subpath" />
    <xsl:text>&#xA;</xsl:text>
  </xsl:template>

  <xsl:template name="link">
    <xsl:variable name="subpath">
      <xsl:call-template name="subpath" />
    </xsl:variable>
    <xsl:variable name="subpath_inv">
      <xsl:call-template name="subpath">
        <xsl:with-param name="inverse" select="true()"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:text>ln -fs </xsl:text>
    <xsl:value-of select="concat($subpath_inv,'index.html ')" />
    <xsl:value-of select="concat($subpath,'index.html')" />
    <xsl:text>&#xA;</xsl:text>
  </xsl:template>

  <xsl:template name="subfeed">
    <xsl:variable name="subpath_qxp">
      <xsl:call-template name="subpath_qxp" />
    </xsl:variable>
    <xsl:text>xsltproc --param subfeed </xsl:text>
    <xsl:value-of select="concat('//',$subpath_qxp)" />
    <xsl:text> ../atom.xsl gallery.xml &gt; </xsl:text>
    <xsl:value-of select="@name" />
    <xsl:text>/index.atom&#xA;</xsl:text>
  </xsl:template>

  <xsl:template match="pano" mode="create">
    <xsl:call-template name="mkdir" />
    <xsl:call-template name="link" />
  </xsl:template>

  <xsl:template match="section" mode="create">
    <xsl:call-template name="mkdir" />
    <xsl:call-template name="link" />
    <xsl:call-template name="subfeed" />
    <xsl:apply-templates select="pano" mode="create" />
  </xsl:template>

  <xsl:template match="section" mode="delete">
    <xsl:variable name="subpath">
      <xsl:call-template name="subpath" />
    </xsl:variable>
    <xsl:text>rm -rfv </xsl:text><xsl:value-of select="$subpath" />
    <xsl:text>&#xA;</xsl:text>
  </xsl:template>

</xsl:stylesheet>
