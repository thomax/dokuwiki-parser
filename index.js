/*********************************************************************
 *                                                                   *
 *   Copyright 2016 Simon M. Werner                                  *
 *                                                                   *
 *   Licensed to the Apache Software Foundation (ASF) under one      *
 *   or more contributor license agreements.  See the NOTICE file    *
 *   distributed with this work for additional information           *
 *   regarding copyright ownership.  The ASF licenses this file      *
 *   to you under the Apache License, Version 2.0 (the               *
 *   "License"); you may not use this file except in compliance      *
 *   with the License.  You may obtain a copy of the License at      *
 *                                                                   *
 *      http://www.apache.org/licenses/LICENSE-2.0                   *
 *                                                                   *
 *   Unless required by applicable law or agreed to in writing,      *
 *   software distributed under the License is distributed on an     *
 *   "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY          *
 *   KIND, either express or implied.  See the License for the       *
 *   specific language governing permissions and limitations         *
 *   under the License.                                              *
 *                                                                   *
 *********************************************************************/

'use strict'

exports.parse = parseFunction
exports.getTitle = getTitle
exports.getLine = getLine

/**
 * This will parse the given (dokuwikiMarkdown) markdown string as dokuwiki text
 * and convert it to HTML.
 * @param  {String} dokuwikiMarkdown The dokuwiki text.9
 * @return {String}                  HTML string.
 */
function parseFunction(doku) {
  var result = []

  /* Convert it to lines */
  doku = doku.split('\n')

  var ulOpen = false
  var elementToUse = 'p'

  doku.forEach(function(line) {
    if (line.trim().length === 0) {
      return
    }
    if (line.indexOf('  -') === 0) {
      if (!ulOpen) {
        result.push('<ul>')
        elementToUse = 'li'
        ulOpen = true
      }
      line = line.substr(3).trim()
    } else if (ulOpen) {
      result.push('</ul>')
      elementToUse = 'p'
      ulOpen = false
    }
    if (line.substr(0, 1) === '=') {
      result.push(getTitle(line))
      return
    }
    result.push(getLine(line, elementToUse))
  })

  if (ulOpen) {
    result.push('</ul>')
  }

  return result.join('\n')
}

function getTitle(line) {
  line = line.trim()
  var i = line.search(/[^=]/)
  line = line.substr(i, line.length - i * 2 - 1).trim()
  var element = 'h' + (7 - i)
  return encapsulate(line, element)
}

function getLine(line, elementToUse) {
  var matches = line.match(/\[\[[^\]]*]]/g)
  if (matches !== null) {
    // there are one or more links in here somewhere
    matches.forEach(function(match) {
      const pieces = match
        .replace('[[', '')
        .replace(']]', '')
        .split(':')

      // determine link text
      const linkText =
        match.indexOf('|') > -1 ? match.split('|').slice(-1)[0] : pieces[pieces.length - 1]

      // downcase and snakecase
      pieces[pieces.length - 1] = pieces[pieces.length - 1].toLowerCase().replace(' ', '_')
      const href = pieces.join('/')
      const newString = `<a href="${href}>${linkText}</a>`
      line = line.replace(match, newString)
    })
  }

  return encapsulate(line.trim(), elementToUse)
}

function encapsulate(string, element) {
  if (!element) {
    element = 'p'
  }
  return '<' + element + '>' + string + '</' + element + '>'
}
