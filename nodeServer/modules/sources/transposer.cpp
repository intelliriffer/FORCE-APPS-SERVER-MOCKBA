// Transposer - Midi Transposer for Akai Force on Mockba Mod.
// (c) 2021 - Mockba the Borg / Amit Talwar
// This code is distributed under the WEDGAFAWYDWTCALAYGUPC" license, which means:
//We Don't Give A Fuck About What You Do With This Code As Long As You Give Us Proper Credit

#include <iostream>
#include <cstdio>
#include <cstdlib>
#include <unistd.h>
#include "RtMidi/RtMidi.h"

RtMidiIn *midiIn = 0;
RtMidiOut *midiOut = 0;
std::vector<std::vector<unsigned char> > noteQ;
int TRANSPOSE = 0;

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
            int LAST = TRANSPOSE;
            if (typ != 0xB0 && typ != 0x90)
                return;

            for (uint i = 0; i < noteQ.size(); i++)
            {
                try
                {
                    std::vector<unsigned char> item;
                    item = noteQ.at(i);
                    item.push_back(0); //zero velocity
                    midiOut->sendMessage(&item);
                }
                catch (const std::out_of_range &e)
                {
                    std::cout << "Out of Range error at Note que OFF at flushing: " << i << "\n";
                    return;
                }
            }
            //flush any hanging note ons.

            //handle command messages
            if (typ == 0xB0 && byte1 == 0x03)
            { //transpose based on CC #3
                int TX = byte2 < 36 ? 36 : byte2;
                TX = TX > 96 ? 96 : TX;
                TRANSPOSE = TX - 60;
                //      std::cout << "Transpose: " << TRANSPOSE << "\n";
            }

            if (typ == 0x90)
            { //transpose base on note

                int TX = byte1 < 36 ? 36 : byte1;
                TX = TX > 96 ? 96 : TX;
                TRANSPOSE = TX - 60;
            }
            if (LAST == TRANSPOSE)
                return;

            try
            {
                //  noteQ.clear();
                if (noteQ.size() >= 192) //clear if more than 96 hanging notes in queue //memory management
                {
                    std::cout << "Flushing Large Buffer\n";
                    noteQ.erase(noteQ.begin(), noteQ.begin() + 32);
                }
            }
            catch (const std::out_of_range &e)
            {
                std::cout << "Out of Range error at Note Que Clear\n";
                noteQ.clear();
            }

            return;
        }

        /********* REGULAR MESSAGES ******************/

        if (typ != 0x90 && typ != 0x80 && typ != 0xA0)
        {
            //passthrough incoming message when not transposeable

            midiOut->sendMessage(message);
            return;
        }
        if (typ == 0xA)
        {

            int note = byte1 + TRANSPOSE;
            messageOut.push_back(byte0);
            messageOut.push_back(note);
            messageOut.push_back(byte2);
            midiOut->sendMessage(&messageOut);
            return;
        }

        if (typ == 0x90)
        { //note on messages
            int note = byte1 + TRANSPOSE;
            if (note > 127 || note < 0)
                return;
            messageOut.push_back(byte0);
            messageOut.push_back(note);
            messageOut.push_back(byte2);
            //            std::cout << "ON Ch: " << ch + 1 << " NOTE " << note << "\n";
            midiOut->sendMessage(&messageOut);
            // return;
            for (uint i = 0; i < noteQ.size(); i++)
            {
                try
                {
                    std::vector<unsigned char> item;
                    item = noteQ.at(i);
                    if (item.at(0) == (ch + 0x80) && item.at(1) == note)
                    {
                        return;
                    }
                }
                catch (const std::out_of_range &e)
                {
                    std::cout << "Out of Range error at Note On\n";
                    return;
                }
            }

            //push as note off in queue, better later
            qmSG.push_back(ch + 0x80);
            qmSG.push_back(note);
            try
            {
                noteQ.push_back(qmSG);
            }
            catch (const std::out_of_range &e)
            {
                std::cout << "Out of Range error atPushing in\n";
                return;
            }
        }

        if (typ == 0x80)
        {
            int note = byte1 + TRANSPOSE;
            if (note > 127 || note < 0)
                return;
            messageOut.push_back(byte0);
            messageOut.push_back(note);
            messageOut.push_back(byte2);
            midiOut->sendMessage(&messageOut);
            //std::cout << "OFF Ch: " << ch + 1 << " NOTE " << note << "\n";

            for (uint i = 0; i < noteQ.size(); i++)
            {
                try
                {
                    std::vector<unsigned char> item;
                    item = noteQ.at(i);
                    if (item.at(0) == byte0 && item.at(1) == note)
                    {
                        noteQ.erase(noteQ.begin() + i);
                        return;
                    }
                }
                catch (const std::out_of_range &e)
                {
                    std::cout << "Out of Range error at Note Off\n";
                }
            }
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
        midiIn->openVirtualPort("Transposer");
    }
    catch (RtMidiError &error)
    {
        error.printMessage();
    }

    try
    {

        midiOut = new RtMidiOut();
        midiOut->openVirtualPort("Transposer");
    }
    catch (RtMidiError &error)
    {
        error.printMessage();
    }

    std::cout << "Transposer Based on Midiloop v1.1 by Mockba the Borg\n";
    while (true)
    {
        SLEEP(500);
    }

    delete midiIn;
    delete midiOut;

    return 0;
}
