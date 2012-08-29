<?xml version="1.0"?>

<xsl:stylesheet version="1.0"
		xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:template name="subpath">
    <xsl:param name="suffix" select="''" />
    <xsl:variable name="name" select="@name" />
    <xsl:choose>
      <xsl:when test="$name">
        <xsl:for-each select="..">
          <xsl:call-template name="subpath">
            <xsl:with-param name="suffix" select="concat($name,'/',$suffix)" />
          </xsl:call-template>
        </xsl:for-each>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$suffix" />
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="subpath_qxp">
    <xsl:param name="suffix" select="''" />
    <xsl:variable name="name" select="@name" />
    <xsl:variable name="qname">\'<xsl:value-of select="$name" />\'</xsl:variable>
    <xsl:variable name="qxp"
                  select="concat(local-name(),'[@name=',$qname,']')" />
    <xsl:choose>
      <xsl:when test="$name and $suffix=''">
        <xsl:for-each select="..">
          <xsl:call-template name="subpath_qxp">
            <xsl:with-param name="suffix" select="$qxp" />
          </xsl:call-template>
        </xsl:for-each>
      </xsl:when>
      <xsl:when test="$name">
        <xsl:for-each select="..">
          <xsl:call-template name="subpath_qxp">
            <xsl:with-param name="suffix" select="concat($qxp,'/',$suffix)" />
          </xsl:call-template>
        </xsl:for-each>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$suffix" />
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

</xsl:stylesheet>
