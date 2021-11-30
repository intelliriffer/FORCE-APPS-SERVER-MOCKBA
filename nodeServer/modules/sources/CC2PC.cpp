// CC2PC - Convert Midi CC from Foce to  Program and Bank Change Messages for Ext Hardware.
// (c) 2021 - Mockba the Borg / Amit Talwar
// This code is distributed under the "IDGAFAWYDWTCALAYGMPC" license, which means:
// //We Don't Give A Fuck About What You Do With This Code As Long As You Give Us Proper Credit

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
using std::chrono::duration_cast;
using std::chrono::milliseconds;
using std::chrono::seconds;
using std::chrono::system_clock;
/****************** Function Declatrations */
void sendBank(int ch);
void sendProgram(int ch, int program);
void listOutputs();
uint getOutput(std::string str);
void checkHW(std::string m);
/********************** Globals *******************/

RtMidiIn *midiIn = 0;
RtMidiOut *HWOut = 0;

#define SLEEP(milliseconds) usleep((unsigned long)(milliseconds * 1000))
int BANKS[16][2] = {0};
bool HWREADY = false;
/******************** FUNCTIONS ***********************/
void mycallback(double deltatime, std::vector<unsigned char> *message, void * /*userData*/)
{

    int byte0 = (int)message->at(0);
    int byte1 = (int)message->at(1);
    int byte2 = (int)message->at(2);
    int ch = byte0 & 0x0F;
    int typ = byte0 & 0xF0;
    if (typ == 0xB0)
    {
        if (byte1 >= 1 && byte1 <= 16) //Send PC
        {
            sendProgram(byte1 - 1, byte2);
            return;
        }
        if (byte1 >= 21 && byte1 <= 36) //Send Bank LSB
        {                               //CC32
            int bCH = byte1 - 21;
            BANKS[bCH][1] = byte2;
            sendBank(bCH);

            return;
        }
        if (byte1 >= 41 && byte1 <= 56) //Send Bank MSB
        {                               //CC 0
            int bCH = byte1 - 41;
            BANKS[bCH][0] = byte2;
            sendBank(bCH);
            return;
        }
    }
}

int main(int argc, char *argv[])
{
    if (argc < 2)
    {
        throw std::invalid_argument("You much Provide a String to Match for  Midi Hardware Port!");
        return 1;
    }
    std::string MIDINAME = argv[1];

    try
    {
        midiIn = new RtMidiIn();
        midiIn->setCallback(&mycallback);
        midiIn->ignoreTypes(true, true, true);
        midiIn->openVirtualPort("CC2PC");
    }
    catch (RtMidiError &error)
    {
        error.printMessage();
    }
    try
    {
        HWOut = new RtMidiOut();
    }
    catch (RtMidiError &error)
    {
        error.printMessage();
    }

    std::cout << "CC2PC Based on Midiloop v1.1 by Mockba the Borg\n";
    while (true)
    {
        if (!HWREADY)
            checkHW(MIDINAME);
        SLEEP(100); //100 ms Wait loop
    }

    delete midiIn;

    delete HWOut;
    return 0;
}
void checkHW(std::string m)
{
    uint outID = getOutput(m);
    if (outID != 99)
    {
        HWOut->openPort(outID);
        std::cout << "CC2PC HW Port Opened: " << outID << " " << HWOut->getPortName(outID) << "\n";
        HWREADY = true;
    }
}
void sendBank(int ch)
{
    if (!HWREADY)
        return;
    std::vector<unsigned char> messageOut;
    int pch = (int)(0xB0 + ch);
    messageOut.push_back(pch);
    messageOut.push_back(0);
    messageOut.push_back(BANKS[ch][0]);

    HWOut->sendMessage(&messageOut);
    messageOut.clear();
    messageOut.push_back(pch);
    messageOut.push_back(32);
    messageOut.push_back(BANKS[ch][1]);

    HWOut->sendMessage(&messageOut);
    sendProgram(ch, 0);
}

void sendProgram(int ch, int program)
{
    if (!HWREADY)
        return;
    std::vector<unsigned char> messageOut;
    int pch = (int)(0xC0 + ch);
    // std::cout << "Prg: " << pch << " = " << program << "\n";
    messageOut.push_back(pch);
    messageOut.push_back(program);
    HWOut->sendMessage(&messageOut);
}

void listOutputs()
{
    uint nPorts = HWOut->getPortCount();
    for (uint i = 0; i < nPorts; i++)
    {
        std::string portName = HWOut->getPortName(i);

        std::cout << "Port: " << i << " = " << portName << "\n";
    }
}
uint getOutput(std::string str)
{
    uint nPorts = HWOut->getPortCount();
    for (uint i = 0; i < nPorts; i++)
    {
        std::string portName = HWOut->getPortName(i);
        size_t found = portName.find(str);
        if (found != string::npos)
        {
            return i;
        }
    }
    return 99;
}