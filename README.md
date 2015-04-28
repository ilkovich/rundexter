Overview
========
RunDexter is an SDK for managing code for rundexter.com.

Installation
============
 git clone https://github.com/lexicalbits/rundexter.git
 cd rundexter
 npm install
 sudo ln -s ./bin/dexter /usr/bin/
 dexter login <your email>

Configuration
=============
The SDK should run out of the box with no issues.

Dexter developers can take advantage of several special environment variables:

 * DEXTER_HOST Defaults to rundexter.com, can be set to any machine name
 * DEXTER_HOST_HTTPS Defaults to 1, can be set to 0 if DEXTER_HOST doesn't support HTTPS
 * DEXTER_DEV Defaults to 0, can be set to 1 to see some additional debugging output.  Note that this does not provide any additional functionality to an end user.
