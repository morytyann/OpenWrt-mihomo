#!/bin/sh

opkg remove mihomo --force-removal-of-dependent-packages
rm -rf /etc/mihomo
rm -f /etc/config/mihomo
