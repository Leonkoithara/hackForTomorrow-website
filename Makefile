CC = g++
CFLAGS = -g -Wall
all:sort
sort:sorting.o
sorting.o:sorting.cpp
clean:
	rm -f sorting.o sort

