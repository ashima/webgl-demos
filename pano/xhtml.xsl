<?xml version="1.0"?>

<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  
  <xsl:variable name="demo-text" select="document('lang/en.xml')" />
  <xsl:output method="xml" />

  <xsl:template match="gallery">
    <html>
      <head>
        <title><xsl:apply-templates select="title" /></title>
      </head>
      <body onload="main()">
        <article id="pano-container">
          <div class="isResizable" id="panodiv" width="200" height="200" />
          <nav data-base-uri="{@host-base}">
            <ul id="zoom">
              <li id="bZoomIn" class="zoomin" />
              <li id="bZoomOut" class="zoomout" />
            </ul>
            <div id="navcat">
              <xsl:call-template name="section-index" />
              <xsl:apply-templates select="section" />
            </div>
            <div id="loadmsg" class="status">
              <xsl:value-of select="$demo-text/messages/*[@id='pano/load']" />
            </div>
            <div id="errormsg" class="status" style="text-align: center">
              <xsl:value-of select="$demo-text/messages/*[@id='pano/error']" />
            </div>
          </nav>
          <script type="text/javascript" src="engine/awe0.js"></script>
          <script type="text/javascript" src="pano.js"></script>
          <script type="text/javascript" src="pano_ui.js"></script>
        </article>
      </body>
    </html>
  </xsl:template>

  <xsl:template match="gallery/title"><xsl:value-of select="." /></xsl:template>
  <xsl:template match="section/title">
    <h1><xsl:value-of select="." /></h1>
  </xsl:template>

  <xsl:template match="section">
    <div class="section" data-uri="{@name}">
      <xsl:apply-templates select="title" />
      <xsl:call-template name="section-index" />
      <!-- TODO: subsections -->
      <xsl:apply-templates select="pano" />
    </div>
  </xsl:template>

  <xsl:template match="pano">
    <div class="pano" data-uri="{@name}">
      <img src="panos/{@thumb}" title="{title}" />
    </div>
  </xsl:template>

  <xsl:template match="term"><em><xsl:value-of select="." /></em></xsl:template>

  <xsl:template match="@* | node()">
    <xsl:copy>
      <xsl:apply-templates select="@*|node()" />
    </xsl:copy>
  </xsl:template>

  <xsl:template name="section-index">
    <div class="index">
      <h1><xsl:value-of select="title" /></h1>
      <p>
        <xsl:apply-templates select="description/node()" />
      </p>
    </div>
  </xsl:template>

</xsl:stylesheet>
