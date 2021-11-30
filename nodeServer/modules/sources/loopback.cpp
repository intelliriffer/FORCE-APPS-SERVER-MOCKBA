// Loopback - Midi Loopoback Module for Mockba Mod App Server.
// (c) 2021 - Mockba the Borg / Amit Talwar
// This code is distributed under the WEDGAFAWYDWTCALAYGUPC" license, which means:
//We Don't Give A Fuck About What You Do With This Code As Long As You Give Us Proper Credit

#include <iostream>
#include <cstdio>
#include <cstdlib>
#include <unistd.h>
#include <chrono>
#include <sys/time.h>
#include <ctime>
#include <sstream>
#include "RtMidi/RtMidi.h"
using std::string;

RtMidiIn *midiIn = 0;
RtMidiOut *midiOut = 0;
#define SLEEP(milliseconds) usleep((unsigned long)(milliseconds * 1000))

void mycallback(double deltatime, std::vector<unsigned char> *message, void * /*userData*/)
{
    midiOut->sendMessage(message); //just spit message back
}

int main(int argc, char ** /*argv[]*/)
{
    try
    {

        midiIn = new RtMidiIn();
        midiIn->setCallback(&mycallback);
        midiIn->ignoreTypes(true, true, true);
        // Open input Virtual Port
        midiIn->openVirtualPort("Loopback");
    }
    catch (RtMidiError &error)
    {
        error.printMessage();
    }

    try
    {

        // RtMidiOut constructor
        midiOut = new RtMidiOut();
        // Open output Virtual Port
        midiOut->openVirtualPort("Loopback");
    }
    catch (RtMidiError &error)
    {
        error.printMessage();
    }

    std::cout << "Loopback Based on Midiloop v1.1 by Mockba the Borg\n";
    while (true)
    {
        SLEEP(5); //5 ms loop
    }

    delete midiIn;
    delete midiOut;

    return 0;
}
