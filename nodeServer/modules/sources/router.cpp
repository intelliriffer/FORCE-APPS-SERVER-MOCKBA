// Transposer - Midi Transposer for Akai Force on Mockba Mod.
// (c) 2021 - Mockba the Borg / Amit Talwar
// This code is distributed under the WEDGAFAWYDWTCALAYGUPC" license, which means:
//We Don't Give A Fuck About What You Do With This Code As Long As You Give Us Proper Credit

#include <iostream>
#include <cstdio>
#include <cstdlib>
#include <unistd.h>
#include "RtMidi/RtMidi.h"

struct C_CHANNEL
{
    unsigned char MIN = 0;
    unsigned char MAX = 127;
    int TRANSPOSE = 0;
};

C_CHANNEL CONFIG[8];

RtMidiIn *midiIn = 0;
RtMidiOut *midiOut = 0;
std::vector<std::vector<unsigned char> > noteQ;
#define SLEEP(milliseconds) usleep((unsigned long)(milliseconds * 1))
void mycallback(double deltatime, std::vector<unsigned char> *message, void * /*userData*/)
{
    try
    {

        std::vector<unsigned char> messageOut;
        std::vector<unsigned char> qmSG;

        int byte0 = (int)message->at(0);
        int byte1 = (int)message->at(1);
        int byte2 = 0;
        if (message->size() > 2)
            byte2 = (int)message->at(2);
        int ch = byte0 & 0x0F;
        int typ = byte0 & 0xF0;
        if (ch == 15)
        {
            //  int LAST = TRANSPOSE;
            if (typ != 0xB0)
                return;

            //handle command messages
            unsigned char inCH = 0;
            switch (byte1)
            {
            case 20:
            case 21:
            case 22:
                inCH = 1;
                break;
            case 23:
            case 24:
            case 25:
                inCH = 2;
                break;
            case 26:
            case 27:
            case 28:
                inCH = 3;
                break;
            case 29:
            case 30:
            case 31:
                inCH = 4;
                break;
            case 32:
            case 33:
            case 34:
                inCH = 5;
                break;
            case 35:
            case 36:
            case 37:
                inCH = 6;
                break;
            case 38:
            case 39:
            case 40:
                inCH = 7;
                break;
            case 41:
            case 42:
            case 43:
                inCH = 8;
                break;
            default:
                inCH = -1;
                return; //invalid cc do nothing
            }
            switch (byte1)
            {

            case 20:
            case 23:
            case 26:
            case 29:
            case 32:
            case 35:
            case 38:
            case 41: // set MIN Value;
                CONFIG[inCH - 1].MIN = byte2;
                break;
            case 21:
            case 24:
            case 27:
            case 30:
            case 33:
            case 36:
            case 39:
            case 42: //set MAX Value
                CONFIG[inCH - 1].MAX = byte2;
                break;
            case 22:
            case 25:
            case 28:
            case 31:
            case 34:
            case 37:
            case 40:
            case 43: //set transpose
                int TX = byte2 < 24 ? 24 : (int)byte2;
                TX = TX > 120 ? 120 : TX;
                CONFIG[inCH - 1].TRANSPOSE = TX - 60;
                break;
            }

            /*  std::cout << "CH: " << (int)inCH << " MIN: "
                      << (int)CONFIG[inCH - 1].MIN
                      << " Max: "
                      << (int)CONFIG[inCH - 1].MAX
                      << " Transpose: "
                      << (int)CONFIG[inCH - 1].TRANSPOSE
                      << "\n "
                      << std::flush;*/
        }

        /********* REGULAR MESSAGES ******************/

        if (ch == 0 && typ != 0x90 && typ != 0x80 && typ != 0xA0)
        {
            //passthrough incoming message when not transposeable
            midiOut->sendMessage(message);
            return;
        }

        if (ch == 0 && (typ == 0x90 || typ == 0x80 || typ == 0xA))
        {

            int note = byte1;
            for (int i = 0; i < 8; i++)
            {
                C_CHANNEL CHH = CONFIG[i];
                int tx = (int)note + CHH.TRANSPOSE;
                if (note >= CHH.MIN && note <= CHH.MAX && tx >= 0 && tx <= 127)
                {
                    std::vector<unsigned char> Out;
                    Out.push_back(i + typ);
                    Out.push_back(tx);
                    Out.push_back(byte2);
                    midiOut->sendMessage(&Out);
                }
            }
            return;
        }
    }
    catch (...)
    {
        std::cout << "There was Some Error\n";
    }
}

int main(int argc, char ** /*argv[]*/)
{
    try
    {

        midiIn = new RtMidiIn();
        midiIn->setCallback(&mycallback);
        midiIn->ignoreTypes(true, true, true);
        midiIn->openVirtualPort("Router");
    }
    catch (RtMidiError &error)
    {
        error.printMessage();
    }

    try
    {

        midiOut = new RtMidiOut();
        midiOut->openVirtualPort("Router");
    }
    catch (RtMidiError &error)
    {
        error.printMessage();
    }

    std::cout << "Router Based on Midiloop v1.1 by Mockba the Borg\n";
    while (true)
    {
        SLEEP(500);
    }

    delete midiIn;
    delete midiOut;

    return 0;
}
